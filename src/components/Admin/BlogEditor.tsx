import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { generateBlogSummary } from '../../config/gemini';
import { Blog } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Sparkles, Eye } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  tags: z.string(),
  published: z.boolean()
});

type FormData = z.infer<typeof schema>;

interface BlogEditorProps {
  blog?: Blog | null;
  onClose: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: blog?.title || '',
      content: blog?.content || '',
      tags: blog?.tags.join(', ') || '',
      published: blog?.published || false
    }
  });

  const watchedContent = watch('content');

  const generateAISuggestions = async () => {
    if (!watchedContent) return;
    
    setIsLoading(true);
    try {
      const suggestions = await generateBlogSummary(watchedContent);
      setAiSuggestions(JSON.parse(suggestions));
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (field: string, value: string) => {
    setValue(field as keyof FormData, value);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const blogData = {
        title: data.title,
        content: data.content,
        tags,
        author: user.displayName || user.email,
        published: data.published,
        updatedAt: new Date()
      };

      if (blog) {
        await updateDoc(doc(db, 'blogs', blog.id), blogData);
      } else {
        await addDoc(collection(db, 'blogs'), {
          ...blogData,
          createdAt: new Date()
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {blog ? 'Edit Article' : 'Create New Article'}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            <span>{preview ? 'Edit' : 'Preview'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {preview ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{watch('title')}</h1>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: watch('content') }}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter article title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  {...register('content')}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your article content here..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  {...register('tags')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="analytics, data, insights"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('published')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Article'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Assistant</h3>
                <button
                  type="button"
                  onClick={generateAISuggestions}
                  disabled={isLoading || !watchedContent}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isLoading ? 'Generating...' : 'Get AI Suggestions'}</span>
                </button>
              </div>

              {aiSuggestions && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">AI Suggestions</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Suggested Title:</p>
                      <p className="text-sm text-gray-600 mt-1">{aiSuggestions.title}</p>
                      <button
                        type="button"
                        onClick={() => applySuggestion('title', aiSuggestions.title)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Summary:</p>
                      <p className="text-sm text-gray-600 mt-1">{aiSuggestions.summary}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Suggested Tags:</p>
                      <p className="text-sm text-gray-600 mt-1">{aiSuggestions.tags?.join(', ')}</p>
                      <button
                        type="button"
                        onClick={() => applySuggestion('tags', aiSuggestions.tags?.join(', '))}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default BlogEditor;