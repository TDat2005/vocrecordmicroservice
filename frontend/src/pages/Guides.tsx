import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen } from 'lucide-react';
import { guides, guideCategories, Guide } from '../data/guides';

export function Guides() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const filteredGuides = guides.filter((guide) => selectedCategory === 'Tất cả' || guide.category === selectedCategory);

  const getDifficultyStyle = (difficulty: Guide['difficulty']): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      'Dễ': { background: '#4ade80', color: '#000' },
      'Trung bình': { background: '#facc15', color: '#000' },
      'Nâng cao': { background: '#ef4444', color: '#fff' },
    };
    return styles[difficulty] || { background: '#fff', color: '#000' };
  };

  return (
    <div className="page page-gray" style={{padding:'2rem 0'}}>
      <div className="container">
        <div className="section-border-2">
          <h1 className="section-title" style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>HƯỚNG DẪN</h1>
          <p style={{fontWeight:700,textTransform:'uppercase'}}>Tất cả những gì bạn cần biết để bắt đầu và nâng cao kiến thức về vinyl</p>
        </div>
        <div className="cat-filters">
          {guideCategories.map((category) => (<button key={category} onClick={() => setSelectedCategory(category)} className={`cat-filter-btn ${selectedCategory === category ? 'active' : ''}`}>{category}</button>))}
        </div>
        <div className="grid-3" style={{gap:'2rem'}}>
          {filteredGuides.map((guide) => (
            <Link key={guide.id} to={`/guide/${guide.id}`} className="blog-card">
              <div className="blog-card-img">
                <img src={guide.image} alt={guide.title} />
                <div style={{position:'absolute',top:'0.5rem',right:'0.5rem',border:'2px solid #000',padding:'0.25rem 0.75rem',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',...getDifficultyStyle(guide.difficulty)}}>{guide.difficulty}</div>
                <div style={{position:'absolute',top:'0.5rem',left:'0.5rem',background:'#000',color:'#fff',border:'2px solid #000',padding:'0.25rem 0.75rem',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>{guide.category}</div>
              </div>
              <div className="blog-card-body">
                <h2 style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'0.75rem'}} className="line-clamp-2">{guide.title}</h2>
                <p style={{color:'#1f2937',fontWeight:500,fontSize:'0.875rem',marginBottom:'1rem'}} className="line-clamp-3">{guide.description}</p>
                <div className="blog-card-meta"><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><BookOpen style={{width:20,height:20}} />Đọc Bài Viết</div><span>→</span></div>
              </div>
            </Link>
          ))}
        </div>
        {filteredGuides.length === 0 && (<div className="empty-state" style={{marginTop:'2rem'}}><p>KHÔNG TÌM THẤY HƯỚNG DẪN NÀO.</p></div>)}
      </div>
    </div>
  );
}
