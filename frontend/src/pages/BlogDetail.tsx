import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { blogPosts } from '../data/blog';

export function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (<div className="page page-white" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center',padding:'2rem',border:'2px solid #000',maxWidth:'28rem'}}><h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase'}}>Không tìm thấy bài viết</h2><Link to="/blog" className="btn btn-primary">Quay lại Blog</Link></div></div>);
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page page-gray" style={{paddingBottom:'4rem'}}>
      <div className="container" style={{padding:'2rem 1rem',maxWidth:'56rem'}}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{marginBottom:'1.5rem'}}><ArrowLeft style={{width:20,height:20}} /> QUAY LẠI</button>
        <article style={{background:'#fff',border:'2px solid #000'}}>
          <div style={{aspectRatio:'21/9',borderBottom:'2px solid #000',position:'relative',background:'#e5e7eb',overflow:'hidden'}}>
            <img src={post.image} alt={post.title} style={{width:'100%',height:'100%',objectFit:'cover',mixBlendMode:'multiply'}} />
            <div style={{position:'absolute',top:'1rem',left:'1rem',background:'#facc15',border:'2px solid #000',padding:'0.5rem 1rem',fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem'}}>{post.category}</div>
          </div>
          <div style={{padding:'2rem'}}>
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'1rem',fontSize:'0.875rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem',paddingBottom:'1.5rem',borderBottom:'2px solid #000'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Calendar style={{width:20,height:20}} />{formatDate(post.date)}</div>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',borderLeft:'2px solid #000',paddingLeft:'1rem'}}><User style={{width:20,height:20}} />Tác giả: {post.author}</div>
            </div>
            <h1 style={{fontSize:'2.5rem',fontWeight:700,marginBottom:'2rem',textTransform:'uppercase',lineHeight:1.2,fontFamily:'var(--font-heading)'}}>{post.title}</h1>
            <div style={{fontSize:'1rem',fontWeight:500,lineHeight:1.8}}>
              <p style={{fontSize:'1.25rem',marginBottom:'1.5rem',fontWeight:700,background:'#fef9c3',padding:'1rem',borderLeft:'4px solid #000'}}>{post.description}</p>
              <p style={{marginBottom:'1.5rem'}}>(Đây là nội dung mô phỏng bài viết thực tế). Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,marginTop:'2rem',marginBottom:'1rem',textTransform:'uppercase'}}>1. Sự trở lại mạnh mẽ</h3>
              <p style={{marginBottom:'1.5rem'}}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              <div style={{padding:'1.5rem',background:'#f3f4f6',border:'2px solid #000',margin:'2rem 0',fontWeight:700,textAlign:'center',fontStyle:'italic',fontSize:'1.25rem',textTransform:'uppercase'}}>"Âm nhạc analog mang lại cảm xúc mà nhạc số không thể sao chép."</div>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,marginTop:'2rem',marginBottom:'1rem',textTransform:'uppercase'}}>2. Tương lai của đĩa than</h3>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
