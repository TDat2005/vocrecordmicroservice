import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Info } from 'lucide-react';
import { guides, Guide } from '../data/guides';

export function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const guide = guides.find(g => g.id === Number(id));

  if (!guide) {
    return (<div className="page page-white" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center',padding:'2rem',border:'2px solid #000',maxWidth:'28rem'}}><h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase'}}>Không tìm thấy hướng dẫn</h2><Link to="/guides" className="btn btn-primary">Quay lại Cẩm Nang</Link></div></div>);
  }

  const getDifficultyStyle = (difficulty: Guide['difficulty']): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = { 'Dễ': { background: '#4ade80', color: '#000' }, 'Trung bình': { background: '#facc15', color: '#000' }, 'Nâng cao': { background: '#ef4444', color: '#fff' } };
    return styles[difficulty] || { background: '#fff', color: '#000' };
  };

  return (
    <div className="page page-gray" style={{paddingBottom:'4rem'}}>
      <div className="container" style={{padding:'2rem 1rem',maxWidth:'56rem'}}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{marginBottom:'1.5rem'}}><ArrowLeft style={{width:20,height:20}} /> QUAY LẠI</button>
        <article style={{background:'#fff',border:'2px solid #000'}}>
          <div style={{aspectRatio:'21/9',borderBottom:'2px solid #000',position:'relative',background:'#e5e7eb',overflow:'hidden'}}>
            <img src={guide.image} alt={guide.title} style={{width:'100%',height:'100%',objectFit:'cover',mixBlendMode:'multiply'}} />
            <div style={{position:'absolute',top:'1rem',right:'1rem',border:'2px solid #000',padding:'0.5rem 1rem',fontWeight:700,textTransform:'uppercase',...getDifficultyStyle(guide.difficulty)}}>ĐỘ KHÓ: {guide.difficulty}</div>
            <div style={{position:'absolute',top:'1rem',left:'1rem',background:'#000',border:'2px solid #000',color:'#fff',padding:'0.5rem 1rem',fontWeight:700,textTransform:'uppercase',fontSize:'0.875rem'}}>{guide.category}</div>
          </div>
          <div style={{padding:'2rem'}}>
            <h1 style={{fontSize:'2.5rem',fontWeight:700,marginBottom:'2rem',textTransform:'uppercase',lineHeight:1.2,fontFamily:'var(--font-heading)'}}>{guide.title}</h1>
            <div style={{fontSize:'1rem',fontWeight:500,lineHeight:1.8}}>
              <p style={{fontSize:'1.25rem',marginBottom:'1.5rem',fontWeight:700,background:'#f3f4f6',padding:'1.5rem',border:'2px solid #000',display:'flex',gap:'1rem',alignItems:'flex-start'}}><Info style={{width:32,height:32,flexShrink:0,marginTop:4}} />{guide.description}</p>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,marginTop:'2rem',marginBottom:'1rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem',textTransform:'uppercase'}}>Bước 1: Chuẩn bị dụng cụ</h3>
              <ul style={{listStyle:'disc',paddingLeft:'1.5rem',marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}><li>Bộ chảo cọ làm sạch chuyên dụng</li><li>Dung dịch vệ sinh đĩa than (được kiểm định)</li><li>Khăn lau sợi Microfiber siêu mịn</li></ul>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,marginTop:'2rem',marginBottom:'1rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem',textTransform:'uppercase'}}>Bước 2: Tiến hành vệ sinh</h3>
              <p style={{marginBottom:'1.5rem'}}>Đặt đĩa than lên một mặt phẳng sạch, có lót nhung bảo vệ. Xịt một lượng vừa đủ dung dịch trải đều bề mặt.</p>
              <div style={{padding:'1.5rem',background:'#facc15',border:'2px solid #000',margin:'2rem 0',fontWeight:700,textTransform:'uppercase'}}>Lưu ý quan trọng: Tuyệt đối không xịt trực tiếp bất kỳ hóa chất gia dụng nào lên bề mặt đĩa than.</div>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,marginTop:'2rem',marginBottom:'1rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem',textTransform:'uppercase'}}>Bước 3: Bảo quản</h3>
              <p>Sau khi lau khô bằng khăn Microfiber, hãy cất trữ đĩa trong bao chống tĩnh điện Polyethylene rồi nhét vào bìa giấy cứng. Đặt đĩa dựng thẳng đứng tại nơi khô ráo, tránh ánh sáng mặt trời!</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
