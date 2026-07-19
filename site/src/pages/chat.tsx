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

type SessionMenuState = {
  sessionId: string;
  open: boolean;
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
                {typeof source.score === 'number' ? (
                  <span className={styles.sourceScore}>Match {Math.round(source.score * 100)}%</span>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function getSessionDisplayTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    return 'New chat';
  }
  return trimmed;
}

function IconNewChat() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconBrand() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.2c-1.7 0-3.3.6-4.5 1.8l-.9.9A6.4 6.4 0 0 0 5 10.5v3a6.4 6.4 0 0 0 1.6 4.6l.9.9A6.4 6.4 0 0 0 12 21.2c1.7 0 3.3-.6 4.5-1.8l.9-.9A6.4 6.4 0 0 0 19 13.9v-3a6.4 6.4 0 0 0-1.6-4.6l-.9-.9A6.4 6.4 0 0 0 12 3.2Zm0 3.1a2.2 2.2 0 0 1 2.2 2.2v7.1A2.2 2.2 0 0 1 12 17.8a2.2 2.2 0 0 1-2.2-2.2V8.5A2.2 2.2 0 0 1 12 6.3Z" />
    </svg>
  );
}

function IconToggleOpen() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function IconToggleClose() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="18" cy="12" r="1.7" />
    </svg>
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
  const [sessionMenu, setSessionMenu] = useState<SessionMenuState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const visibleSessions = useMemo(
    () => sessions.slice(0, MAX_SIDEBAR_SESSIONS),
    [sessions],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
  }, [messages, status]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!sessionMenu) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSessionMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSessionMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sessionMenu]);

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
    setSessionMenu(null);
    localStorage.setItem(STORAGE_SESSION_KEY, freshSessionId);
  }

  function openSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setError('');
    setSessionMenu(null);
  }

  function toggleSessionMenu(sessionId: string) {
    setSessionMenu((current) =>
      current?.sessionId === sessionId && current.open
        ? null
        : {sessionId, open: true},
    );
  }

  function toggleSidebar() {
    setSidebarOpen((current) => !current);
    setSessionMenu(null);
  }

  async function deleteSession(sessionId: string) {
    const shouldDelete =
      typeof window === 'undefined'
        ? true
        : window.confirm('Delete this chat session and all of its history?');
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await readJson<{detail?: string}>(response);
        throw new Error(payload.detail || 'Unable to delete the selected session.');
      }

      setSessions((previous) => {
        const next = previous.filter((session) => session.session_id !== sessionId);
        localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(next));
        return next;
      });
      setSessionMenu(null);

      if (sessionId === activeSessionId) {
        startNewChat();
      } else {
        await refreshSessions();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete the selected session.');
    }
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

        <section className={styles.shell}>
          <aside
            className={`${styles.sidebarShell} ${
              sidebarOpen ? styles.sidebarShellOpen : styles.sidebarShellCollapsed
            }`}>
            <div className={styles.sidebarRail}>
              <button
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                className={styles.railButton}
                onClick={toggleSidebar}
                title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                type="button">
                {sidebarOpen ? <IconToggleClose /> : <IconToggleOpen />}
              </button>

              <div className={styles.railDivider} />

              <button
                aria-label="New chat"
                className={styles.railButton}
                onClick={startNewChat}
                title="New chat"
                type="button">
                <IconNewChat />
              </button>

              <div className={styles.railSpacer} />

              <button
                aria-label="Knowlegebase home"
                className={styles.brandMark}
                onClick={startNewChat}
                title="Knowlegebase"
                type="button">
                <IconBrand />
              </button>
            </div>

            {sidebarOpen ? (
              <div className={styles.sidebarPanel}>
                <div className={styles.sidebarHeader}>
                  <h2>Chats</h2>
                  <span>{visibleSessions.length} saved</span>
                </div>

                <div className={styles.sessionList}>
                  {visibleSessions.length > 0 ? (
                    visibleSessions.map((session) => (
                      <div
                        className={`${styles.sessionRow} ${
                          session.session_id === activeSessionId ? styles.sessionRowActive : ''
                        }`}
                        key={session.session_id}>
                        <button
                          className={styles.sessionItem}
                          title={getSessionDisplayTitle(session.title || 'New chat')}
                          onClick={() => openSession(session.session_id)}
                          type="button">
                          <strong
                            className={styles.sessionTitle}
                            title={getSessionDisplayTitle(session.title || 'New chat')}>
                            {getSessionDisplayTitle(session.title || 'New chat')}
                          </strong>
                        </button>
                        <div
                          className={styles.sessionMenuWrap}
                          ref={
                            sessionMenu?.sessionId === session.session_id ? menuRef : undefined
                          }>
                          <button
                            aria-label={`Session actions for ${session.title || 'New chat'}`}
                            className={styles.sessionMenuButton}
                            onClick={() => toggleSessionMenu(session.session_id)}
                            type="button">
                            <IconDots />
                          </button>
                          {sessionMenu?.sessionId === session.session_id && sessionMenu.open ? (
                            <div className={styles.sessionMenu} role="menu">
                              <button
                                className={styles.sessionMenuItemDanger}
                                onClick={() => void deleteSession(session.session_id)}
                                type="button">
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <strong>No chats yet</strong>
                      <span>Start a conversation and your history will appear here.</span>
                    </div>
                  )}
                </div>

                <div className={styles.sidebarFooter}>
                  <p>
                    The backend keeps session history in SQLite, while retrieval runs over the docs
                    in this repository.
                  </p>
                </div>
              </div>
            ) : null}
          </aside>

          <section className={styles.chatPanel}>
            <header className={styles.chatHeader}>
              <div>
                <h2>{sessionTitle}</h2>
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
                  <h3>Ready when you are.</h3>
                  <p>
                    Ask about any note, notebook, or practical guide in the knowledgebase. The
                    assistant will retrieve relevant context and answer from the docs.
                  </p>
                  <div className={styles.emptyActions}>
                    <button className={styles.primaryButton} onClick={startNewChat} type="button">
                      Ask anything
                    </button>
                    {/* <div className={styles.emptyHints}>
                      <span>Create an answer</span>
                      <span>Look something up</span>
                      <span>Write or edit</span>
                    </div> */}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className={styles.composer} onSubmit={(event) => void submitMessage(event)}>
              <textarea
                aria-label="Ask the knowledgebase chatbot"
                className={styles.input}
                placeholder="Ask anything"
                rows={3}
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <div className={styles.composerFooter}>
                <span>Uses local open-source models via Ollama.</span>
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
