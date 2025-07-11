
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageWrapper from '../layout/PageWrapper';
import type { FormOption } from '../../types';
import { PlusIcon, TrashIcon } from '../ui/Icons';

const FormCreator: React.FC = () => {
  const { addForm, updateForm, getFormById } = useApp();
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<FormOption[]>([{ id: `opt-${Date.now()}`, label: '', limit: 30 }]);

  const isEditing = Boolean(formId);

  useEffect(() => {
    if (isEditing && formId) {
      const existingForm = getFormById(formId);
      if (existingForm) {
        setTitle(existingForm.title);
        setDescription(existingForm.description);
        setOptions(existingForm.options);
      }
    }
  }, [formId, isEditing, getFormById]);

  const handleOptionChange = (index: number, field: keyof FormOption, value: string | number) => {
    const newOptions = [...options];
    (newOptions[index] as any)[field] = field === 'limit' ? Number(value) : value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { id: `opt-${Date.now()}`, label: '', limit: 30 }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() === '' || options.some(opt => opt.label.trim() === '')) {
      alert('Please fill in the form title and all option labels.');
      return;
    }

    const formToSave = {
      id: isEditing && formId ? formId : `form-${Date.now()}`,
      title,
      description,
      options,
      createdAt: isEditing ? getFormById(formId!)!.createdAt : new Date().toISOString(),
    };
    
    if (isEditing) {
        updateForm(formToSave);
    } else {
        addForm(formToSave);
    }
    
    navigate('/admin/dashboard');
  };

  return (
    <PageWrapper title={isEditing ? "Edit Form" : "Create a New Form"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Form Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            placeholder="e.g., Fall Open House 2024"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            placeholder="A brief description of the event or form."
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Registration Options</h3>
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex-grow">
                <label className="text-xs text-gray-500">Option Label</label>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  placeholder="e.g., Morning Session"
                  required
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-gray-500">Capacity Limit</label>
                <input
                  type="number"
                  value={option.limit}
                  onChange={(e) => handleOptionChange(index, 'limit', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 1}
                className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-400"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="flex items-center text-sm font-medium text-brand-primary hover:text-brand-secondary"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Another Option
          </button>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-brand-secondary">
            {isEditing ? 'Save Changes' : 'Create Form'}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default FormCreator;
