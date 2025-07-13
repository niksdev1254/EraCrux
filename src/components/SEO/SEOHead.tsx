import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'DataCruxx - AI-Powered Analytics Platform',
  description = 'Transform your data into actionable insights with DataCruxx\'s AI-powered analytics platform. Upload files, generate dashboards, and discover intelligent insights.',
  keywords = 'data analytics, AI dashboard, business intelligence, data visualization, CSV analysis, PDF analysis',
  image = '/og-image.png',
  url = 'https://datacruxx.com',
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}) => {
  const fullTitle = title.includes('DataCruxx') ? title : `${title} | DataCruxx`;
  const fullUrl = url.startsWith('http') ? url : `https://datacruxx.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://datacruxx.com${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || 'DataCruxx Team'} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="DataCruxx" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@datacruxx" />
      <meta name="twitter:creator" content="@datacruxx" />

      {/* Article specific tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'Article' : 'WebSite',
          "name": fullTitle,
          "description": description,
          "url": fullUrl,
          "image": fullImage,
          ...(type === 'article' && {
            "author": {
              "@type": "Person",
              "name": author || 'DataCruxx Team'
            },
            "publisher": {
              "@type": "Organization",
              "name": "DataCruxx",
              "logo": {
                "@type": "ImageObject",
                "url": "https://datacruxx.com/logo.png"
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime
          })
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;