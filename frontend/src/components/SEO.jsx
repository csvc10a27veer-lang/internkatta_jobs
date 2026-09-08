import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'InternKatta - Online Internships & Courses | Skill Development Platform',
  description = 'Join InternKatta for industry-ready internships and premium courses. Get hands-on experience, mentorship, and certification. Start your career journey today!',
  keywords = 'internships, online courses, skill development, industrial training, MSBTE training, career development, online learning, certification programs, project-based learning',
  image = 'https://internkatta.com/logo3.webp',
  url = 'https://internkatta.com',
  type = 'website',
  author = 'InternKatta',
  structuredData = null
}) => {
  const fullTitle = title.includes('InternKatta') ? title : `${title} | InternKatta`;
  const fullUrl = url.startsWith('http') ? url : `https://internkatta.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://internkatta.com${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="InternKatta" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@internkatta" />
      <meta name="twitter:site" content="@internkatta" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0052A3" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="InternKatta" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

