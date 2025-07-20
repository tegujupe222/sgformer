import React, { useEffect, useCallback } from 'react';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../utils/i18n';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (_config: {
            client_id: string;
            callback: (_response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            _element: HTMLElement,
            _options: {
              theme: string;
              size: string;
              shape?: string;
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleCredentialResponse {
  credential: string;
}

const Login: React.FC = () => {
  const { login, isLoading, error } = useApp();
  const navigate = useNavigate();
  const { auth, app } = useTranslation();

  const handleGoogleSignIn = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        console.log('Google Sign-In response received:', response);
        await login(response.credential);
        navigate('/dashboard');
      } catch (error) {
        console.error('Google sign-in error:', error);
        // Google sign-in error handled silently
      }
    },
    [login, navigate]
  );

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log('Initializing Google Sign-In...');
      console.log('Google object available:', !!window.google);
      console.log(
        'Google accounts available:',
        !!(window.google && window.google.accounts)
      );
      console.log('Client ID:', process.env.VITE_GOOGLE_CLIENT_ID);

      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.VITE_GOOGLE_CLIENT_ID || '',
            callback: handleGoogleSignIn,
          });

          const buttonElement = document.getElementById('google-signin-button');
          console.log('Button element found:', !!buttonElement);
          if (buttonElement) {
            window.google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              shape: 'rectangular',
              width: 400,
            });
            console.log('Google Sign-In button rendered successfully');
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    // Google Sign-Inスクリプトが読み込まれるまで待機
    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      // スクリプトがまだ読み込まれていない場合、複数回試行
      let attempts = 0;
      const maxAttempts = 10;

      const tryInitialize = () => {
        attempts++;
        console.log(`Attempt ${attempts} to initialize Google Sign-In...`);

        if (window.google && window.google.accounts) {
          initializeGoogleSignIn();
        } else if (attempts < maxAttempts) {
          setTimeout(tryInitialize, 500);
        } else {
          console.error(
            'Failed to initialize Google Sign-In after multiple attempts'
          );
        }
      };

      setTimeout(tryInitialize, 500);
    }
  }, [handleGoogleSignIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-bold text-brand-dark mb-2">
          <span className="font-light">SG</span>former
        </h1>
        <p className="text-gray-500 mb-8">{app('tagline')}</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div
            id="google-signin-button"
            className="w-full flex justify-center"
            style={{ minHeight: '40px' }}
          ></div>
          {/* フォールバックボタン - Google Sign-Inが失敗した場合 */}
          <button
            onClick={() => {
              console.log('Fallback button clicked');
              // デモ用のログイン処理
              login('demo-user-token');
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ログイン中...' : 'Googleでログイン（フォールバック）'}
          </button>
          {/* デモ用ボタンは本番環境では表示しない */}
          {import.meta.env.DEV && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>
              <button
                onClick={() => login('demo-user-token')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                一般ユーザー（デモ）
              </button>
              <button
                onClick={() => login('demo-admin-token')}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                管理者（デモ）
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-8">{auth('demoMessage')}</p>
      </div>
    </div>
  );
};

export default Login;
