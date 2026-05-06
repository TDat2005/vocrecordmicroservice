import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, User } from 'lucide-react';
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

export function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(API.content.postDetail(id))
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPost(data.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page page-white" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',padding:'2rem'}}><h2 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase'}}>Đang tải bài viết...</h2></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page page-white" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',padding:'2rem',border:'2px solid #000',maxWidth:'28rem'}}>
          <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase'}}>Không tìm thấy bài viết</h2>
          <Link to="/blog" className="btn btn-primary">Quay lại Blog</Link>
        </div>
      </div>
    );
  }

  const dateStr = post.created_at || post.createdAt || '';
  const formatDate = (ds: string) => {
    if (!ds) return '';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="page page-gray" style={{paddingBottom:'4rem'}}>
      <div className="container" style={{padding:'2rem 1rem',maxWidth:'56rem'}}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{marginBottom:'1.5rem'}}><ArrowLeft style={{width:20,height:20}} /> QUAY LẠI</button>
        <article style={{background:'#fff',border:'2px solid #000'}}>
          <div style={{aspectRatio:'21/9',borderBottom:'2px solid #000',position:'relative',background:'#e5e7eb',overflow:'hidden'}}>
            <img src={post.image || 'https://images.unsplash.com/photo-1460039230329-eb070fc6c77c?w=600'} alt={post.title} style={{width:'100%',height:'100%',objectFit:'cover',mixBlendMode:'multiply'}} />
            <div style={{position:'absolute',top:'1rem',left:'1rem',background:'#facc15',border:'2px solid #000',padding:'0.5rem 1rem',fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem'}}>{typeLabels[post.type] || post.type}</div>
          </div>
          <div style={{padding:'2rem'}}>
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'1rem',fontSize:'0.875rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem',paddingBottom:'1.5rem',borderBottom:'2px solid #000'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Calendar style={{width:20,height:20}} />{formatDate(dateStr) || 'Mới đăng'}</div>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',borderLeft:'2px solid #000',paddingLeft:'1rem'}}><User style={{width:20,height:20}} />Tác giả: Vọc Records</div>
            </div>
            <h1 style={{fontSize:'2.5rem',fontWeight:700,marginBottom:'2rem',textTransform:'uppercase',lineHeight:1.2,fontFamily:'var(--font-heading)'}}>{post.title}</h1>
            <div
              style={{fontSize:'1rem',fontWeight:500,lineHeight:1.8}}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
