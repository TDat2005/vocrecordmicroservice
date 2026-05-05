import { useState } from 'react';
import { Link } from 'react-router';
import { Calendar, User } from 'lucide-react';
import { blogPosts, categories } from '../data/blog';

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const filteredPosts = blogPosts.filter((post) => selectedCategory === 'Tất cả' || post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="page page-gray" style={{padding:'2rem 0'}}>
      <div className="container">
        <div className="section-border-2" style={{marginBottom:'2rem'}}>
          <h1 className="section-title" style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>CHUYÊN TRANG BÀI VIẾT</h1>
          <p style={{fontWeight:700,textTransform:'uppercase'}}>Tin tức, kiến thức và câu chuyện thú vị về thế giới âm nhạc Analog</p>
        </div>
        <div className="cat-filters">
          {categories.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`cat-filter-btn ${selectedCategory === category ? 'active' : ''}`}>{category}</button>
          ))}
        </div>
        <div className="grid-3" style={{gap:'2rem'}}>
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="blog-card">
              <div className="blog-card-img">
                <img src={post.image} alt={post.title} />
                <div style={{position:'absolute',top:'0.5rem',left:'0.5rem',background:'#facc15',border:'2px solid #000',padding:'0.25rem 0.75rem',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>{post.category}</div>
              </div>
              <div className="blog-card-body">
                <h2 style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'0.75rem'}} className="line-clamp-2">{post.title}</h2>
                <p style={{color:'#1f2937',fontWeight:500,fontSize:'0.875rem',marginBottom:'1rem'}} className="line-clamp-3">{post.description}</p>
                <div className="blog-card-meta">
                  <div style={{display:'flex',alignItems:'center',gap:'0.25rem'}}><Calendar style={{width:16,height:16}} />{formatDate(post.date)}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.25rem'}}><User style={{width:16,height:16}} />{post.author}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filteredPosts.length === 0 && (<div className="empty-state" style={{marginTop:'2rem'}}><p>KHÔNG CÓ BÀI VIẾT NÀO TRONG MỤC NÀY.</p></div>)}
      </div>
    </div>
  );
}
