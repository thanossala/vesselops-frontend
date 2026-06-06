import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Helper component to expose context values for testing
function AuthConsumer() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <span data-testid="role">{user?.role ?? ''}</span>
      <button onClick={() => login('captain@vessel.com', 'pass123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('AuthContext', () => {
  it('starts in loading state, finishes ready when no token', async () => {
    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('fetches current user when token exists in localStorage', async () => {
    localStorage.setItem('token', 'existing-token');
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { user: { id: '1', email: 'captain@vessel.com', role: 'captain' } },
    });

    render(<AuthProvider><AuthConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('captain@vessel.com');
    expect(screen.getByTestId('role')).toHaveTextContent('captain');
  });

  it('logs out if token is invalid on load', async () => {
    localStorage.setItem('token', 'bad-token');
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));

    render(<AuthProvider><AuthConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('login stores token and sets user', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('no token')); // no initial token
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        token: 'new-jwt-token',
        user: { id: '2', email: 'captain@vessel.com', role: 'captain' },
      },
    });

    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(localStorage.getItem('token')).toBe('new-jwt-token');
    expect(screen.getByTestId('user')).toHaveTextContent('captain@vessel.com');
  });

  it('logout clears user and token', async () => {
    localStorage.setItem('token', 'valid-token');
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { user: { id: '1', email: 'captain@vessel.com', role: 'captain' } },
    });

    render(<AuthProvider><AuthConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('captain@vessel.com'));

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
