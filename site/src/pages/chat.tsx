import {useEffect, useMemo, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import styles from './chat.module.css';

type ChatRole = 'user' | 'assistant';

type ChatSource = {
  title: string;
  source_path: string;
  blob_url: string;
  heading?: string | null;
  score?: number;
  excerpt?: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
  createdAt: string;
  pending?: boolean;
  error?: boolean;
};

type SessionSummary = {
  session_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
};

type SessionResponse = {
  session_id: string;
  title: string;
  messages: Array<{
    role: ChatRole;
    content: string;
    created_at: string;
    sources?: ChatSource[];
  }>;
};

type ChatResponse = {
  session_id: string;
  answer: string;
  title: string;
  sources: ChatSource[];
};

const STORAGE_SESSION_KEY = 'knowlegebase.chat.activeSessionId';
const STORAGE_SESSIONS_KEY = 'knowlegebase.chat.sessions';
const MAX_SIDEBAR_SESSIONS = 12;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sessionTitleFromQuestion(question: string): string {
  const cleaned = question.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return 'New chat';
  }
  return cleaned.length > 56 ? `${cleaned.slice(0, 53)}...` : cleaned;
}

function formatTime(isoString: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || 'The chatbot backend returned an invalid response.');
  }
}

function mergeSessions(primary: SessionSummary[], secondary: SessionSummary[]): SessionSummary[] {
  const byId = new Map<string, SessionSummary>();
  for (const session of secondary) {
    byId.set(session.session_id, session);
  }
  for (const session of primary) {
    byId.set(session.session_id, session);
  }
  return [...byId.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

function MessageBubble({message}: {message: ChatMessage}) {
  return (
    <article className={`${styles.message} ${styles[message.role]}`}>
      <div className={styles.messageMeta}>
        <span>{message.role === 'user' ? 'You' : 'Knowlegebase'}</span>
        <span>{formatTime(message.createdAt)}</span>
      </div>
      <div className={styles.messageBody}>
        {message.pending ? (
          <span className={styles.pending}>Thinking with local models...</span>
        ) : (
          <pre className={styles.messageText}>{message.content}</pre>
        )}
      </div>
      {message.sources && message.sources.length > 0 ? (
        <div className={styles.sources}>
          <div className={styles.sourcesLabel}>Sources used</div>
          <div className={styles.sourceGrid}>
            {message.sources.map((source) => (
              <a
                className={styles.sourceCard}
                key={`${source.source_path}-${source.heading ?? source.title}`}
                href={source.blob_url}
                target="_blank"
                rel="noreferrer">
                <span className={styles.sourceTitle}>{source.title}</span>
                {source.heading ? <span className={styles.sourceHeading}>{source.heading}</span> : null}
                {typeof source.score === 'number' ? (
                  <span className={styles.sourceScore}>Match {Math.round(source.score * 100)}%</span>
                ) : null}
                {source.excerpt ? <p>{source.excerpt}</p> : null}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function ChatPage() {
  const {siteConfig} = useDocusaurusContext();
  const apiBaseUrl =
    (siteConfig.customFields?.chatbotApiUrl as string | undefined) ?? 'http://localhost:8080';
  const [ready, setReady] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState<string>('New chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const visibleSessions = useMemo(
    () => sessions.slice(0, MAX_SIDEBAR_SESSIONS),
    [sessions],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
  }, [messages, status]);

  useEffect(() => {
    const storedSessions = localStorage.getItem(STORAGE_SESSIONS_KEY);
    const storedSessionId = localStorage.getItem(STORAGE_SESSION_KEY);

    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions) as SessionSummary[]);
      } catch {
        localStorage.removeItem(STORAGE_SESSIONS_KEY);
      }
    }

    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
    } else {
      const freshSessionId = createId();
      setActiveSessionId(freshSessionId);
      localStorage.setItem(STORAGE_SESSION_KEY, freshSessionId);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !activeSessionId) {
      return;
    }

    localStorage.setItem(STORAGE_SESSION_KEY, activeSessionId);
  }, [activeSessionId, ready]);

  useEffect(() => {
    if (!ready || !activeSessionId) {
      return;
    }

    const controller = new AbortController();

    async function loadSession() {
      setStatus('loading');
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl}/api/sessions/${activeSessionId}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          setSessionTitle('New chat');
          setMessages([]);
          setStatus('idle');
          return;
        }
        if (!response.ok) {
          throw new Error(`Unable to load session history (${response.status}).`);
        }
        const data = await readJson<SessionResponse>(response);
        setSessionTitle(data.title || 'New chat');
        setMessages(
          data.messages.map((message) => ({
            id: createId(),
            role: message.role,
            content: message.content,
            createdAt: message.created_at,
            sources: message.sources,
          })),
        );
        setStatus('idle');
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setMessages([]);
        setSessionTitle('New chat');
        setStatus('idle');
        setError(
          err instanceof Error
            ? err.message
            : 'The chatbot backend is not reachable yet. Start the API to load sessions.',
        );
      }
    }

    loadSession();

    return () => controller.abort();
  }, [activeSessionId, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const controller = new AbortController();

    async function loadSessions() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/sessions?limit=${MAX_SIDEBAR_SESSIONS}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }
        const data = (await readJson<{sessions: SessionSummary[]}>(response)).sessions ?? [];
        setSessions((previous) => {
          const merged = mergeSessions(data, previous);
          localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(merged));
          return merged;
        });
      } catch {
        // Keep the local list if the backend is offline.
      }
    }

    loadSessions();

    return () => controller.abort();
  }, [ready]);

  async function refreshSessions() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/sessions?limit=${MAX_SIDEBAR_SESSIONS}`);
      if (!response.ok) {
        return;
      }
      const data = (await readJson<{sessions: SessionSummary[]}>(response)).sessions ?? [];
      setSessions((previous) => {
        const merged = mergeSessions(data, previous);
        localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(merged));
        return merged;
      });
    } catch {
      // Non-fatal: the active conversation still works.
    }
  }

  function startNewChat() {
    const freshSessionId = createId();
    setActiveSessionId(freshSessionId);
    setSessionTitle('New chat');
    setMessages([]);
    setInput('');
    setError('');
    localStorage.setItem(STORAGE_SESSION_KEY, freshSessionId);
  }

  function openSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setError('');
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status === 'loading') {
      return;
    }

    const sessionId = activeSessionId || createId();
    if (!activeSessionId) {
      setActiveSessionId(sessionId);
      localStorage.setItem(STORAGE_SESSION_KEY, sessionId);
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantMessageId = createId();

    setMessages((previous) => [
      ...previous,
      userMessage,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
    setInput('');
    setStatus('loading');
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: trimmed,
        }),
      });

      const payload = await readJson<ChatResponse>(response);
      if (!response.ok) {
        throw new Error((payload as unknown as {detail?: string}).detail ?? 'The chatbot request failed.');
      }

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: payload.answer,
        createdAt: new Date().toISOString(),
        sources: payload.sources,
      };

      setActiveSessionId(payload.session_id);
      setSessionTitle(payload.title || sessionTitleFromQuestion(trimmed));
      setMessages((previous) => previous.map((message) => (message.id === assistantMessageId ? assistantMessage : message)));
      await refreshSessions();
    } catch (err) {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                pending: false,
                error: true,
                content:
                  err instanceof Error
                    ? err.message
                    : 'Something went wrong while asking the chatbot.',
              }
            : message,
        ),
      );
      setError(err instanceof Error ? err.message : 'Something went wrong while asking the chatbot.');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <Layout
      title="Chat"
      description="Ask the knowlegebase chatbot questions grounded in your documentation.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Open-source answers, grounded in your docs</p>
            <h1>Knowlegebase Chat</h1>
            <p>
              Ask a question and the chatbot retrieves relevant markdown from this repository,
              then answers using a local open-source model.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={startNewChat} type="button">
              New chat
            </button>
            <Link className={styles.secondaryButton} to="/docs/">
              Browse docs
            </Link>
          </div>
        </section>

        <section className={styles.shell}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Sessions</h2>
              <span>{visibleSessions.length} saved</span>
            </div>

            <div className={styles.sessionList}>
              {visibleSessions.length > 0 ? (
                visibleSessions.map((session) => (
                  <button
                    key={session.session_id}
                    className={`${styles.sessionItem} ${
                      session.session_id === activeSessionId ? styles.sessionItemActive : ''
                    }`}
                    onClick={() => void openSession(session.session_id)}
                    type="button">
                    <strong>{session.title || 'New chat'}</strong>
                    <span>{session.message_count} messages</span>
                    <small>{formatTime(session.updated_at)}</small>
                  </button>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <strong>No saved sessions yet</strong>
                  <span>Start a conversation and it will appear here.</span>
                </div>
              )}
            </div>

            <div className={styles.sidebarFooter}>
              <p>
                The backend keeps session history in SQLite, while retrieval runs over the docs in
                this repository.
              </p>
            </div>
          </aside>

          <section className={styles.chatPanel}>
            <header className={styles.chatHeader}>
              <div>
                <h2>{sessionTitle}</h2>
                <p>Session ID: {activeSessionId}</p>
              </div>
              <div className={styles.statusBadge}>
                <span className={`${styles.statusDot} ${status === 'loading' ? styles.statusDotLive : ''}`} />
                {status === 'loading' ? 'Working' : 'Ready'}
              </div>
            </header>

            {error ? <div className={styles.alert}>{error}</div> : null}

            <div className={styles.messages}>
              {messages.length > 0 ? (
                messages.map((message) => <MessageBubble key={message.id} message={message} />)
              ) : (
                <div className={styles.emptyTranscript}>
                  <h3>Start with a question</h3>
                  <p>
                    Try something like “How do I build a chatbot with session history?” or
                    “What is LangGraph persistence?” and the assistant will ground the answer in
                    this knowledgebase.
                  </p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className={styles.composer} onSubmit={(event) => void submitMessage(event)}>
              <textarea
                aria-label="Ask the knowledgebase chatbot"
                className={styles.input}
                placeholder="Ask about any note, notebook, or practical guide..."
                rows={3}
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <div className={styles.composerFooter}>
                <span>
                  Uses local open-source models via Ollama. Set `DOCUSAURUS_CHATBOT_API_URL` to
                  point the site at your backend.
                </span>
                <button className={styles.primaryButton} disabled={status === 'loading'} type="submit">
                  {status === 'loading' ? 'Asking...' : 'Send'}
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </Layout>
  );
}
