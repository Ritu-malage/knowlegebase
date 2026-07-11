from __future__ import annotations

import hashlib
import json
import math
import os
import re
import sqlite3
import time
import urllib.request
import uuid
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = Path(os.getenv("KBASE_DOCS_ROOT", ROOT / "site" / "docs"))
DB_PATH = Path(os.getenv("KBASE_CHATBOT_DB", Path(__file__).resolve().with_name("chatbot.db")))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "qwen2.5:7b-instruct")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
SERVER_HOST = os.getenv("CHATBOT_HOST", "127.0.0.1")
SERVER_PORT = int(os.getenv("CHATBOT_PORT", "8080"))
MAX_HISTORY_MESSAGES = int(os.getenv("CHATBOT_HISTORY_MESSAGES", "10"))
MAX_SOURCES = int(os.getenv("CHATBOT_SOURCE_COUNT", "4"))

GITHUB_BLOB_BASE = "https://github.com/Ritu-malage/knowlegebase/blob/main"


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def short_title(question: str) -> str:
    normalized = re.sub(r"\s+", " ", question).strip()
    if not normalized:
        return "New chat"
    words = normalized.split(" ")
    return " ".join(words[:8])[:64]


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right:
        return 0.0
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))
    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0
    return dot / (left_norm * right_norm)


def tokenize(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9_]+", text.lower()) if len(token) > 2}


def markdown_to_text(markdown: str) -> str:
    text = re.sub(r"```.*?```", " ", markdown, flags=re.DOTALL)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text


def split_markdown_into_chunks(markdown: str, max_chars: int = 1200, overlap: int = 140) -> list[tuple[str, str]]:
    lines = markdown.splitlines()
    heading_stack: list[str] = []
    blocks: list[tuple[str, str]] = []
    current: list[str] = []
    current_heading = ""

    def flush_current() -> None:
        if current:
            blocks.append((current_heading, "\n".join(current).strip()))
            current.clear()

    for line in lines:
        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line.strip())
        if heading_match:
            flush_current()
            level = len(heading_match.group(1))
            title = heading_match.group(2).strip()
            heading_stack[:] = heading_stack[: level - 1]
            heading_stack.append(title)
            current_heading = " > ".join(heading_stack)
            current.append(line)
            continue
        if line.strip():
            current.append(line)
        else:
            flush_current()

    flush_current()

    chunks: list[tuple[str, str]] = []
    for heading, block in blocks:
        if not block:
            continue
        if len(block) <= max_chars:
            chunks.append((heading, block.strip()))
            continue

        start = 0
        while start < len(block):
            end = min(len(block), start + max_chars)
            segment = block[start:end].strip()
            if segment:
                chunks.append((heading, segment))
            if end >= len(block):
                break
            start = max(end - overlap, start + 1)

    if not chunks and markdown.strip():
        chunks.append(("", markdown.strip()))
    return chunks


def build_blob_url(source_path: str) -> str:
    relative = Path(source_path).resolve().relative_to(ROOT)
    return f"{GITHUB_BLOB_BASE}/{relative.as_posix()}"


def chat_endpoint(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        raw = response.read().decode("utf-8")
    return json.loads(raw)


def try_ollama_chat(messages: list[dict[str, str]]) -> str:
    payload = {
        "model": CHAT_MODEL,
        "messages": messages,
        "stream": False,
    }
    data = chat_endpoint(f"{OLLAMA_BASE_URL}/api/chat", payload)
    if isinstance(data.get("message"), dict):
        content = data["message"].get("content")
        if content:
            return content
    if isinstance(data.get("response"), str):
        return data["response"]
    raise RuntimeError("Ollama chat response did not include model text.")


def try_ollama_embedding(text: str) -> list[float]:
    candidates = [
        (f"{OLLAMA_BASE_URL}/api/embeddings", {"model": EMBED_MODEL, "prompt": text}),
        (f"{OLLAMA_BASE_URL}/api/embed", {"model": EMBED_MODEL, "input": text}),
    ]
    last_error: Exception | None = None
    for url, payload in candidates:
        try:
            data = chat_endpoint(url, payload)
            if isinstance(data.get("embedding"), list):
                return [float(value) for value in data["embedding"]]
            if isinstance(data.get("embeddings"), list) and data["embeddings"]:
                first = data["embeddings"][0]
                if isinstance(first, list):
                    return [float(value) for value in first]
        except Exception as exc:  # pragma: no cover - network failures are expected in some setups
            last_error = exc
    raise RuntimeError(
        "Unable to generate embeddings with Ollama. Start Ollama and pull the embedding model."
    ) from last_error


@dataclass(frozen=True)
class ChunkRecord:
    id: int
    source_path: str
    title: str
    heading: str
    chunk_index: int
    content: str
    embedding: list[float]

    @property
    def source_label(self) -> str:
        return self.title or Path(self.source_path).name

    @property
    def blob_url(self) -> str:
        return build_blob_url(self.source_path)


class Database:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_schema(self) -> None:
        with self.connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
                );

                CREATE TABLE IF NOT EXISTS docs (
                    source_path TEXT PRIMARY KEY,
                    content_hash TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS chunks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_path TEXT NOT NULL,
                    title TEXT NOT NULL,
                    heading TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding_json TEXT NOT NULL,
                    content_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )

    def doc_manifest(self) -> dict[str, str]:
        manifest: dict[str, str] = {}
        for path in sorted(DOCS_ROOT.rglob("*.md")):
            if not path.is_file():
                continue
            manifest[str(path.resolve())] = sha256_text(path.read_text(encoding="utf-8"))
        return manifest

    def is_index_current(self) -> bool:
        current = self.doc_manifest()
        with self.connect() as conn:
            rows = conn.execute("SELECT source_path, content_hash FROM docs").fetchall()
        stored = {str(row["source_path"]): str(row["content_hash"]) for row in rows}
        return current == stored and len(current) > 0

    def rebuild_index(self) -> None:
        manifest = self.doc_manifest()
        with self.connect() as conn:
            conn.execute("DELETE FROM chunks")
            conn.execute("DELETE FROM docs")
            for source_path, content_hash in manifest.items():
                conn.execute(
                    "INSERT INTO docs(source_path, content_hash, updated_at) VALUES (?, ?, ?)",
                    (source_path, content_hash, now_iso()),
                )

            for source_path in sorted(manifest):
                path = Path(source_path)
                markdown = path.read_text(encoding="utf-8")
                title = self.extract_title(markdown, path)
                chunks = split_markdown_into_chunks(markdown)
                for index, (heading, chunk_text) in enumerate(chunks):
                    try:
                        embedding = try_ollama_embedding(chunk_text)
                    except Exception:
                        embedding = []
                    conn.execute(
                        """
                        INSERT INTO chunks(
                            source_path, title, heading, chunk_index, content, embedding_json, content_hash, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            source_path,
                            title,
                            heading,
                            index,
                            chunk_text,
                            json.dumps(embedding),
                            sha256_text(chunk_text),
                            now_iso(),
                        ),
                    )
            conn.commit()

    def ensure_index(self) -> None:
        if not self.is_index_current():
            self.rebuild_index()

    def extract_title(self, markdown: str, path: Path) -> str:
        for line in markdown.splitlines():
            match = re.match(r"^#\s+(.+)$", line.strip())
            if match:
                return match.group(1).strip()
        return path.stem.replace("_", " ").replace("-", " ").title()

    def get_recent_sessions(self, limit: int = 20) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT
                    s.session_id,
                    s.title,
                    s.created_at,
                    s.updated_at,
                    COUNT(m.id) AS message_count
                FROM sessions s
                LEFT JOIN messages m ON m.session_id = s.session_id
                GROUP BY s.session_id
                ORDER BY s.updated_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def ensure_session(self, session_id: str, initial_title: str = "New chat") -> None:
        with self.connect() as conn:
            row = conn.execute(
                "SELECT session_id FROM sessions WHERE session_id = ?",
                (session_id,),
            ).fetchone()
            if row is None:
                timestamp = now_iso()
                conn.execute(
                    "INSERT INTO sessions(session_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
                    (session_id, initial_title, timestamp, timestamp),
                )
                conn.commit()

    def update_session_title(self, session_id: str, title: str) -> None:
        with self.connect() as conn:
            conn.execute(
                "UPDATE sessions SET title = ?, updated_at = ? WHERE session_id = ?",
                (title, now_iso(), session_id),
            )
            conn.commit()

    def touch_session(self, session_id: str) -> None:
        with self.connect() as conn:
            conn.execute(
                "UPDATE sessions SET updated_at = ? WHERE session_id = ?",
                (now_iso(), session_id),
            )
            conn.commit()

    def add_message(self, session_id: str, role: str, content: str) -> None:
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO messages(session_id, role, content, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (session_id, role, content, now_iso()),
            )
            conn.execute(
                "UPDATE sessions SET updated_at = ? WHERE session_id = ?",
                (now_iso(), session_id),
            )
            conn.commit()

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            session = conn.execute(
                "SELECT session_id, title, created_at, updated_at FROM sessions WHERE session_id = ?",
                (session_id,),
            ).fetchone()
            if session is None:
                return None
            messages = conn.execute(
                """
                SELECT role, content, created_at
                FROM messages
                WHERE session_id = ?
                ORDER BY id ASC
                """,
                (session_id,),
            ).fetchall()
        return {
            **dict(session),
            "messages": [dict(row) for row in messages],
        }

    def get_recent_messages(self, session_id: str, limit: int = 10) -> list[dict[str, str]]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT role, content
                FROM messages
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (session_id, limit),
            ).fetchall()
        return [dict(row) for row in reversed(rows)]

    def fetch_chunks(self) -> list[ChunkRecord]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT id, source_path, title, heading, chunk_index, content, embedding_json
                FROM chunks
                ORDER BY id ASC
                """
            ).fetchall()
        return [
            ChunkRecord(
                id=int(row["id"]),
                source_path=str(row["source_path"]),
                title=str(row["title"]),
                heading=str(row["heading"]),
                chunk_index=int(row["chunk_index"]),
                content=str(row["content"]),
                embedding=[float(value) for value in json.loads(row["embedding_json"])],
            )
            for row in rows
        ]


def lexical_overlap_score(question_tokens: set[str], content: str) -> float:
    if not question_tokens:
        return 0.0
    content_tokens = tokenize(content)
    if not content_tokens:
        return 0.0
    overlap = len(question_tokens & content_tokens)
    return overlap / max(len(question_tokens), 1)


def retrieve_context(db: Database, question: str, top_k: int = MAX_SOURCES) -> list[dict[str, Any]]:
    chunks = db.fetch_chunks()
    if not chunks:
        return []

    question_embedding: list[float] | None = None
    try:
        question_embedding = try_ollama_embedding(question)
    except Exception:
        question_embedding = None

    question_tokens = tokenize(question)
    scored: list[tuple[float, ChunkRecord]] = []
    for chunk in chunks:
        vector_score = cosine_similarity(question_embedding, chunk.embedding) if question_embedding else 0.0
        lexical_score = lexical_overlap_score(question_tokens, chunk.content)
        final_score = (0.72 * vector_score) + (0.28 * lexical_score)
        scored.append((final_score, chunk))

    scored.sort(key=lambda item: item[0], reverse=True)

    results: list[dict[str, Any]] = []
    seen_sources: set[str] = set()
    for score, chunk in scored:
        if score <= 0:
            continue
        if chunk.source_path in seen_sources and len(results) >= top_k:
            continue

        source_id = Path(chunk.source_path).name
        result = {
            "title": chunk.source_label,
            "source_path": chunk.source_path,
            "blob_url": chunk.blob_url,
            "heading": chunk.heading or None,
            "score": round(score, 4),
            "excerpt": markdown_to_text(chunk.content)[:360].strip(),
        }
        results.append(result)
        seen_sources.add(chunk.source_path)
        if len(results) >= top_k:
            break
    return results


def format_context_blocks(sources: list[dict[str, Any]]) -> str:
    blocks = []
    for index, source in enumerate(sources, start=1):
        heading = source.get("heading") or "Top match"
        blocks.append(
            "\n".join(
                [
                    f"[Source {index}]",
                    f"Title: {source.get('title', '')}",
                    f"Heading: {heading}",
                    f"Path: {source.get('source_path', '')}",
                    f"Excerpt: {source.get('excerpt', '')}",
                ]
            )
        )
    return "\n\n".join(blocks)


def build_prompt(question: str, recent_messages: list[dict[str, str]], sources: list[dict[str, Any]]) -> list[dict[str, str]]:
    system_text = (
        "You are the Knowlegebase chatbot. Answer using only the provided knowledgebase context. "
        "If the context does not contain enough information, say that you could not find a confident "
        "answer in the knowledgebase and offer the closest useful pointers. "
        "Keep answers concise, practical, and accurate. Cite the source titles naturally in the response."
    )
    context_text = format_context_blocks(sources)
    messages = [{"role": "system", "content": system_text}]
    if context_text:
        messages.append(
            {
                "role": "system",
                "content": f"Knowledgebase context:\n\n{context_text}",
            }
        )
    for message in recent_messages:
        messages.append({"role": message["role"], "content": message["content"]})
    messages.append({"role": "user", "content": question})
    return messages


def fallback_answer(question: str, sources: list[dict[str, Any]]) -> str:
    lines = [
        "I could not reach the local open-source model, so here is the best matched knowledgebase context instead:",
        "",
    ]
    for index, source in enumerate(sources, start=1):
        lines.append(
            f"{index}. {source.get('title', 'Untitled')} - {source.get('heading') or 'No heading'}"
        )
        excerpt = str(source.get("excerpt", "")).strip()
        if excerpt:
            lines.append(f"   {excerpt}")
    if not sources:
        lines.append("I could not find a strong match in the current docs index.")
    lines.extend(["", f"Question asked: {question}"])
    return "\n".join(lines)


class ChatbotApp:
    def __init__(self, db: Database):
        self.db = db
        self.db.init_schema()
        self.index_ready = False
        try:
            self.db.ensure_index()
            self.index_ready = True
        except Exception:
            # The app should still start if Ollama is not running yet.
            # Retrieval will fall back to lexical matching and assistant replies
            # will use the built-in fallback answer.
            self.index_ready = False

    def list_sessions(self, limit: int = 20) -> dict[str, Any]:
        return {"sessions": self.db.get_recent_sessions(limit)}

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        return self.db.get_session(session_id)

    def chat(self, session_id: str | None, question: str) -> dict[str, Any]:
        question = question.strip()
        if not question:
            raise ValueError("message must not be empty")

        session_id = session_id or str(uuid.uuid4())
        self.db.ensure_session(session_id)
        session = self.db.get_session(session_id)
        if session is not None and (not session["title"] or session["title"] == "New chat"):
            self.db.update_session_title(session_id, short_title(question))

        recent_messages = self.db.get_recent_messages(session_id, limit=MAX_HISTORY_MESSAGES)
        self.db.add_message(session_id, "user", question)
        sources = retrieve_context(self.db, question, top_k=MAX_SOURCES)
        prompt = build_prompt(question, recent_messages, sources)

        try:
            answer = try_ollama_chat(prompt)
        except Exception:
            answer = fallback_answer(question, sources)

        self.db.add_message(session_id, "assistant", answer)
        session = self.db.get_session(session_id)
        return {
            "session_id": session_id,
            "title": session["title"] if session else short_title(question),
            "answer": answer,
            "sources": sources,
        }


APP = ChatbotApp(Database(DB_PATH))


class ChatbotHandler(BaseHTTPRequestHandler):
    server_version = "KnowlegebaseChatbot/1.0"

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003 - keep BaseHTTPRequestHandler signature
        return

    def _set_headers(self, status: int = 200, content_type: str = "application/json") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _json_response(self, status: int, payload: dict[str, Any]) -> None:
        self._set_headers(status)
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def _read_json(self) -> dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            return {}
        raw = self.rfile.read(content_length).decode("utf-8")
        if not raw.strip():
            return {}
        return json.loads(raw)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._set_headers(HTTPStatus.NO_CONTENT)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self._json_response(
                HTTPStatus.OK,
                {
                    "ok": True,
                    "docs_root": str(DOCS_ROOT),
                    "chat_model": CHAT_MODEL,
                    "embed_model": EMBED_MODEL,
                },
            )
            return

        if self.path.startswith("/api/sessions/"):
            session_id = self.path.split("/api/sessions/", 1)[1].strip("/")
            session = APP.get_session(session_id)
            if session is None:
                self._json_response(HTTPStatus.NOT_FOUND, {"detail": "Session not found."})
                return
            self._json_response(HTTPStatus.OK, session)
            return

        if self.path.startswith("/api/sessions"):
            limit = 20
            if "?" in self.path:
                query = self.path.split("?", 1)[1]
                for part in query.split("&"):
                    key, _, value = part.partition("=")
                    if key == "limit" and value.isdigit():
                        limit = int(value)
            self._json_response(HTTPStatus.OK, APP.list_sessions(limit))
            return

        self._json_response(HTTPStatus.NOT_FOUND, {"detail": "Not found."})

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/chat":
            self._json_response(HTTPStatus.NOT_FOUND, {"detail": "Not found."})
            return

        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._json_response(HTTPStatus.BAD_REQUEST, {"detail": "Invalid JSON body."})
            return

        message = str(payload.get("message", "")).strip()
        session_id = payload.get("session_id")
        if not message:
            self._json_response(HTTPStatus.BAD_REQUEST, {"detail": "message is required."})
            return

        try:
            result = APP.chat(session_id=session_id if isinstance(session_id, str) else None, question=message)
            self._json_response(HTTPStatus.OK, result)
        except Exception as exc:
            self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"detail": str(exc)})


def main() -> None:
    print(f"Knowlegebase chatbot API listening on http://{SERVER_HOST}:{SERVER_PORT}")
    print(f"Docs index: {DOCS_ROOT}")
    print(f"Chat model: {CHAT_MODEL}")
    print(f"Embedding model: {EMBED_MODEL}")
    server = ThreadingHTTPServer((SERVER_HOST, SERVER_PORT), ChatbotHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
