import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, User } from 'lucide-react';
import { API } from '../config/api';

interface Post {
  id: number;
  title: string;
  content: string;
  type: string;
  image: string;
  account_id: number;
  status: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const typeLabels: Record<string, string> = {
  blog: 'Blog / Tin tức',
  guide: 'Hướng dẫn',
};

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(API.content.posts)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPosts(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(
    (post) => selectedType === 'all' || post.type === selectedType
  );

  const getDate = (post: Post) => post.created_at || post.createdAt || '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const truncate = (text: string, maxLen: number) => {
    if (!text) return '';
    const stripped = text.replace(/<[^>]*>/g, '');
    return stripped.length > maxLen ? stripped.slice(0, maxLen) + '...' : stripped;
  };

  return (
    <div className="page page-gray" style={{padding:'2rem 0'}}>
      <div className="container">
        <div className="section-border-2" style={{marginBottom:'2rem'}}>
          <h1 className="section-title" style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>CHUYÊN TRANG BÀI VIẾT</h1>
          <p style={{fontWeight:700,textTransform:'uppercase'}}>Tin tức, kiến thức và câu chuyện thú vị về thế giới âm nhạc Analog</p>
        </div>
        <div className="cat-filters">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'blog', label: 'Blog / Tin tức' },
            { key: 'guide', label: 'Hướng dẫn' },
          ].map((cat) => (
            <button key={cat.key} onClick={() => setSelectedType(cat.key)} className={`cat-filter-btn ${selectedType === cat.key ? 'active' : ''}`}>{cat.label}</button>
          ))}
        </div>
        {loading ? (
          <div className="empty-state" style={{marginTop:'2rem'}}><p>ĐANG TẢI BÀI VIẾT...</p></div>
        ) : (
          <>
            <div className="grid-3" style={{gap:'2rem'}}>
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="blog-card">
                  <div className="blog-card-img">
                    <img src={post.image || 'https://images.unsplash.com/photo-1460039230329-eb070fc6c77c?w=600'} alt={post.title} />
                    <div style={{position:'absolute',top:'0.5rem',left:'0.5rem',background:'#facc15',border:'2px solid #000',padding:'0.25rem 0.75rem',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>{typeLabels[post.type] || post.type}</div>
                  </div>
                  <div className="blog-card-body">
                    <h2 style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'0.75rem'}} className="line-clamp-2">{post.title}</h2>
                    <p style={{color:'#1f2937',fontWeight:500,fontSize:'0.875rem',marginBottom:'1rem'}} className="line-clamp-3">{truncate(post.content, 120)}</p>
                    <div className="blog-card-meta">
                      <div style={{display:'flex',alignItems:'center',gap:'0.25rem'}}><Calendar style={{width:16,height:16}} />{formatDate(getDate(post)) || 'Mới đăng'}</div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.25rem'}}><User style={{width:16,height:16}} />Vọc Records</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredPosts.length === 0 && (<div className="empty-state" style={{marginTop:'2rem'}}><p>KHÔNG CÓ BÀI VIẾT NÀO TRONG MỤC NÀY.</p></div>)}
          </>
        )}
      </div>
    </div>
  );
}
