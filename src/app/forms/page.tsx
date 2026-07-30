import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpenCheck, ClipboardCheck, School } from 'lucide-react'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = { title: 'मासिक प्रतिवेदन फारम | JJSS', description: 'शिक्षक तथा तह सयोजकका मासिक प्रतिवेदन फारमहरू।' }

const forms = [
  { href: '/forms/subject', number: 'फारम १', title: 'विषय शिक्षक मासिक प्रतिवेदन', detail: 'प्रति कक्षा × विषय · करिब ६ मिनेट', icon: BookOpenCheck },
  { href: '/forms/class', number: 'फारम २', title: 'कक्षा शिक्षक मासिक प्रतिवेदन', detail: 'प्रति कक्षा · महिनामा एक पटक', icon: ClipboardCheck },
  { href: '/forms/incharge', number: 'फारम ३', title: 'तह सयोजक मासिक प्रतिवेदन', detail: 'प्रति तह · अवलोकन, सहयोग र निर्णय', icon: School },
]

export default function FormsPage() {
  return <div className="public-page forms-index"><Navigation /><main className="forms-index__shell"><header><p>मासिक शैक्षिक अनुगमन</p><h1>प्रतिवेदन फारमहरू</h1><span>आफ्नो भूमिका अनुसार फारम छान्नुहोस्। शिक्षक ID र मासिक अभिलेख तयार राख्नुहोस्।</span></header><div className="forms-index__grid">{forms.map(({ href, number, title, detail, icon: Icon }) => <Link href={href} className="forms-index__card" key={href}><span className="forms-index__icon"><Icon aria-hidden="true" /></span><small>{number}</small><h2>{title}</h2><p>{detail}</p><strong>फारम खोल्नुहोस् <ArrowRight aria-hidden="true" /></strong></Link>)}</div><aside className="forms-index__help"><strong>फारम भर्नुअघि</strong><p>कक्षा, विषय र शिक्षकको नाम fixed master list बाट मात्र छान्न सकिन्छ। सूचीमा आफ्नो जिम्मेवारी नदेखिएमा प्रशासनसँग class_subject assignment सच्याउन अनुरोध गर्नुहोस्।</p></aside></main></div>
}
