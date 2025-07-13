import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Blog } from '../types';
import Layout from '../components/Layout/Layout';
import SEOHead from '../components/SEO/SEOHead';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  const fetchBlog = async (blogId: string) => {
    try {
      const blogDoc = await getDoc(doc(db, 'blogs', blogId));
      if (blogDoc.exists()) {
        const blogData = {
          id: blogDoc.id,
          ...blogDoc.data(),
          createdAt: blogDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: blogDoc.data().updatedAt?.toDate() || new Date()
        } as Blog;
        setBlog(blogData);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Layout>
        <SEOHead title="Loading..." />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <SEOHead title="Article Not Found" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Article not found.</p>
            <Link
              to="/blogs"
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={blog.title}
        description={blog.summary || blog.content.substring(0, 160)}
        keywords={blog.tags.join(', ')}
        type="article"
        author={blog.author}
        publishedTime={blog.createdAt.toISOString()}
        modifiedTime={blog.updatedAt.toISOString()}
        url={`/blog/${blog.id}`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/blogs"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Blog</span>
          </Link>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(blog.createdAt)}
              <span className="mx-2">•</span>
              <User className="h-4 w-4 mr-1" />
              {blog.author}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {blog.title}
            </h1>
            
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;