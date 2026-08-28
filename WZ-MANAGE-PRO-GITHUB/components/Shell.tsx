import Link from "next/link";
export default function Shell({children}:{children:React.ReactNode}){
 const nav=[["🏠","Dashboard","/dashboard"],["👤","Customer","/customers"],["📅","Booking","/booking"],["🚶","Queue","/queue"],["🧾","POS","/pos"],["📦","Inventory","/inventory"],["💰","Finance","/finance"],["📊","Reports","/reports"]];
 return <div className="shell"><aside className="sidebar"><div className="brand">WZ MANAGE PRO</div><nav className="nav">{nav.map(x=><Link href={x[2]} key={x[2]}>{x[0]}&nbsp; {x[1]}</Link>)}</nav></aside><section className="main">{children}</section></div>
}