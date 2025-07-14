import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// AppProviderのモック
jest.mock('../../context/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-provider">{children}</div>
  ),
}));

// 各コンポーネントのモック
jest.mock('../../components/auth/Login', () => {
  return function MockLogin() {
    return <div data-testid="login">Login Component</div>;
  };
});

jest.mock('../../components/admin/AdminDashboard', () => {
  return function MockAdminDashboard() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
  };
});

jest.mock('../../components/user/UserDashboard', () => {
  return function MockUserDashboard() {
    return <div data-testid="user-dashboard">User Dashboard</div>;
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('App Component', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  test('renders AppProvider', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('app-provider')).toBeInTheDocument();
  });

  test('renders login page by default', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });
});
