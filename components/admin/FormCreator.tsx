import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import PageWrapper from '../layout/PageWrapper';
import type { Question, QuestionType, QuestionOption } from '../../types';
import { PlusIcon, TrashIcon } from '../ui/Icons';

const FormCreator: React.FC = () => {
  const { addForm, updateForm, getFormById } = useApp();
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [requireLogin, setRequireLogin] = useState(true);
  const [maxSubmissions, setMaxSubmissions] = useState<number | undefined>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isEditing = Boolean(formId);

  const questionTypes: {
    value: QuestionType;
    label: string;
    description: string;
  }[] = [
    { value: 'text', label: 'テキスト入力', description: '1行のテキスト入力' },
    {
      value: 'textarea',
      label: 'テキストエリア',
      description: '複数行のテキスト入力',
    },
    {
      value: 'email',
      label: 'メールアドレス',
      description: 'メールアドレス入力',
    },
    { value: 'phone', label: '電話番号', description: '電話番号入力' },
    { value: 'number', label: '数値', description: '数値入力' },
    {
      value: 'select',
      label: 'ドロップダウン選択',
      description: '選択肢から1つ選択',
    },
    { value: 'radio', label: 'ラジオボタン', description: '選択肢から1つ選択' },
    {
      value: 'checkbox',
      label: 'チェックボックス',
      description: '複数選択可能',
    },
    { value: 'date', label: '日付', description: '日付選択' },
    { value: 'time', label: '時間', description: '時間選択' },
    { value: 'datetime', label: '日時', description: '日時選択' },
    {
      value: 'file',
      label: 'ファイルアップロード',
      description: 'ファイルをアップロード',
    },
    { value: 'rating', label: '評価', description: '星評価（1-5）' },
    { value: 'scale', label: 'スケール', description: '数値スケール（1-10）' },
    { value: 'yesno', label: 'はい/いいえ', description: 'はいまたはいいえ' },
  ];

  useEffect(() => {
    if (isEditing && formId) {
      const existingForm = getFormById(formId);
      if (existingForm) {
        setTitle(existingForm.title);
        setDescription(existingForm.description);
        setQuestions(existingForm.questions || []);
        setAllowAnonymous(existingForm.settings?.allowAnonymous || false);
        setRequireLogin(existingForm.settings?.requireLogin || true);
        setMaxSubmissions(existingForm.settings?.maxSubmissions);
        setStartDate(existingForm.settings?.startDate || '');
        setEndDate(existingForm.settings?.endDate || '');
      }
    }
  }, [formId, isEditing, getFormById]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'text',
      label: '',
      description: '',
      required: false,
      isPersonalInfo: false,
      options: [],
      validation: {},
      settings: {},
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string | boolean
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleValidationChange = (
    index: number,
    field: string,
    value: number
  ) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[index].validation) {
      updatedQuestions[index].validation = {};
    }
    (updatedQuestions[index].validation as Record<string, unknown>)[field] =
      value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      label: '',
      value: '',
    };
    question.options = [...(question.options || []), newOption];
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    question.options = question.options?.filter((_, i) => i !== optionIndex);
    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof QuestionOption,
    value: string | number
  ) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    if (question.options) {
      if (field === 'label') {
        question.options[optionIndex].label = value as string;
      } else if (field === 'value') {
        question.options[optionIndex].value = value as string;
      } else if (field === 'limit') {
        question.options[optionIndex].limit = value as number;
      }
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || questions.some(q => q.label.trim() === '')) {
      alert('フォームタイトルとすべての質問のラベルを入力してください。');
      return;
    }

    const formToSave = {
      id: isEditing && formId ? formId : `form-${Date.now()}`,
      title,
      description,
      questions,
      settings: {
        allowAnonymous,
        requireLogin,
        maxSubmissions,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive: true,
      },
      createdAt: isEditing
        ? getFormById(formId!)!.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin', // TODO: 実際のユーザーIDに置き換え
    };

    if (isEditing) {
      updateForm(formToSave);
    } else {
      addForm(formToSave);
    }

    navigate('/admin/dashboard');
  };

  const renderQuestionEditor = (question: Question, index: number) => {
    const needsOptions = ['select', 'radio', 'checkbox'].includes(
      question.type
    );

    return (
      <div
        key={question.id}
        className="bg-gray-50 rounded-lg border p-4 space-y-4"
      >
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-medium">質問 {index + 1}</h4>
          <button
            type="button"
            onClick={() => removeQuestion(index)}
            className="p-2 text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 質問タイプ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            質問タイプ
          </label>
          <select
            value={question.type}
            onChange={e =>
              handleQuestionChange(
                index,
                'type',
                e.target.value as QuestionType
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {questionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* 質問ラベル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            質問ラベル *
          </label>
          <input
            type="text"
            value={question.label}
            onChange={e => handleQuestionChange(index, 'label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="質問を入力してください"
            required
          />
        </div>

        {/* 質問説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明（任意）
          </label>
          <textarea
            value={question.description || ''}
            onChange={e =>
              handleQuestionChange(index, 'description', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
            placeholder="質問の詳細説明"
          />
        </div>

        {/* 必須・個人情報フラグ */}
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={question.required}
              onChange={e =>
                handleQuestionChange(index, 'required', e.target.checked)
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">必須項目</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={question.isPersonalInfo}
              onChange={e =>
                handleQuestionChange(index, 'isPersonalInfo', e.target.checked)
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-700">個人情報</span>
          </label>
        </div>

        {/* 選択肢（select, radio, checkbox用） */}
        {needsOptions && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                選択肢
              </label>
              <button
                type="button"
                onClick={() => addOption(index)}
                className="flex items-center text-sm text-brand-primary hover:text-brand-secondary"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                選択肢を追加
              </button>
            </div>
            {question.options?.map((option, optionIndex) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={e =>
                    updateOption(index, optionIndex, 'label', e.target.value)
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                  placeholder="選択肢のラベル"
                />
                <input
                  type="text"
                  value={option.value}
                  onChange={e =>
                    updateOption(index, optionIndex, 'value', e.target.value)
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                  placeholder="選択肢の値"
                />
                <input
                  type="number"
                  value={option.limit || ''}
                  onChange={e =>
                    updateOption(index, optionIndex, 'limit', e.target.value)
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  placeholder="定員"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index, optionIndex)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* バリデーション設定 */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">
            バリデーション設定
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500">最小文字数</label>
              <input
                type="number"
                value={question.validation?.minLength || ''}
                onChange={e =>
                  handleValidationChange(
                    index,
                    'minLength',
                    Number(e.target.value)
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">最大文字数</label>
              <input
                type="number"
                value={question.validation?.maxLength || ''}
                onChange={e =>
                  handleValidationChange(
                    index,
                    'maxLength',
                    Number(e.target.value)
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper title={isEditing ? 'フォームを編集' : '新しいフォームを作成'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">基本情報</h3>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              フォームタイトル *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="例: 2024年度入学希望者アンケート"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="フォームの目的や説明を入力してください"
            />
          </div>
        </div>

        {/* フォーム設定 */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">フォーム設定</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                回答期間
              </label>
              <div className="space-y-2">
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="開始日時"
                />
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="終了日時"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大回答数
                </label>
                <input
                  type="number"
                  value={maxSubmissions || ''}
                  onChange={e =>
                    setMaxSubmissions(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="制限なし"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allowAnonymous}
                    onChange={e => setAllowAnonymous(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">匿名回答を許可</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={requireLogin}
                    onChange={e => setRequireLogin(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">ログイン必須</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 質問項目 */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">質問項目</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              質問を追加
            </button>
          </div>

          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              質問を追加してください
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) =>
                renderQuestionEditor(question, index)
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-brand-secondary"
          >
            {isEditing ? '変更を保存' : 'フォームを作成'}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default FormCreator;
