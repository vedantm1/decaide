import { Link } from "wouter";
import SidebarNavigation from "@/components/sidebar-navigation";
import MobileHeader from "@/components/mobile-header";

export default function WhyDecadePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <SidebarNavigation />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-0 md:pt-0">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
          {/* Page Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-heading font-bold text-slate-800 mb-4">Why DecA<span className="text-primary">(I)</span>de?</h1>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg">
              More than just a name — our platform represents our mission, values, and commitment to the DECA community.
            </p>
          </header>
          
          {/* Name Meaning Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-6 text-center">Our Name: Four Meanings in One</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">Dec-aide</h3>
                <p className="text-slate-600 flex-grow">
                  We're your dedicated companion in DECA success, providing tailored assistance to excel in every competition. Our platform is designed specifically to aid DECA participants in their journey.
                </p>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">Decade</h3>
                <p className="text-slate-600 flex-grow">
                  Remove the "(I)" and you get "Decade" — symbolizing our long-term commitment to DECA excellence and education that will serve you for years to come. The skills you develop here will benefit you throughout your career.
                </p>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">AI Integration</h3>
                <p className="text-slate-600 flex-grow">
                  The "(I)" represents our cutting-edge artificial intelligence that personalizes your learning experience without replacing the human element. Our AI adapts to your needs while keeping you at the center of your learning journey.
                </p>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary text-xl font-bold">4</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">Individuality</h3>
                <p className="text-slate-600 flex-grow">
                  While DECA emphasizes teamwork, we recognize that personal growth and individual preparation are key to success. The "I" stands for your unique journey, tailored to your specific event, learning style, and goals.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-primary font-medium italic">"Who says there is no I in team?"</p>
            </div>
          </section>
          
          {/* Community Mission Section */}
          <section className="mb-16 bg-primary/5 py-12 px-6 rounded-2xl">
            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-8 text-center">Our Community Mission</h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-slate-700 mb-8 text-center">
                At DecA(I)de, we believe in giving back to the DECA community that inspires us. Our success is measured not just by our growth, but by our impact on business education.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-800 mb-3 text-center">Free Educational Seminars</h3>
                  <p className="text-slate-600">
                    We host regular online and in-person workshops, using our platform to help students who might not have access to premium resources. Our team of DECA experts shares insights and strategies to help all students succeed.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-800 mb-3 text-center">15% to Nonprofit Partners</h3>
                  <p className="text-slate-600">
                    We donate 15% of our profits to DECA's Emerging Leader Scholarship Fund, which provides financial support to outstanding DECA members who demonstrate exceptional leadership potential and academic achievement but face financial barriers. As proud DECA alumni, we're committed to expanding access to high-quality business education.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-800 mb-3 text-center">Scholarship Program</h3>
                  <p className="text-slate-600">
                    Top performers on our platform receive scholarships to attend DECA conferences and competitions. We reward dedication and excellence, supporting students who might otherwise miss these transformative opportunities.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-slate-800 mb-3 text-center">Teacher Resources</h3>
                  <p className="text-slate-600">
                    We provide free resources to DECA advisors to help them better coach their students. Our teacher dashboard, curriculum materials, and professional development opportunities support the educators who make DECA possible.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Vision Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-6 text-center">Our Vision</h2>
            
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <p className="text-lg text-slate-700 mb-4">
                DecA(I)de was born from the frustration of inconsistent DECA preparation resources. We're building not just a tool, but a revolution in how students prepare for business competitions.
              </p>
              
              <p className="text-lg text-slate-700 mb-4">
                By standardizing practice while personalizing feedback, we help every student reach their full potential. Our platform combines the best of human expertise with cutting-edge AI to deliver an experience that's:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="bg-primary/5 p-4 rounded-lg flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-800">Personalized</span>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-800">Consistent</span>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-800">Engaging</span>
                </div>
              </div>
              
              <p className="text-lg text-slate-700">
                Together, we're creating a future where every DECA student has access to world-class preparation resources, regardless of their background or chapter size. Join us in this mission to transform business education and help students develop the skills they need for lifelong success.
              </p>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="mb-16 text-center">
            <div className="bg-primary rounded-xl py-12 px-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="4" vectorEffect="non-scaling-stroke"></path>
                </svg>
              </div>
              
              <h2 className="text-3xl font-heading font-bold text-white mb-4">Ready to Transform Your DECA Experience?</h2>
              <p className="text-primary-50 max-w-2xl mx-auto mb-8 text-lg">
                Join thousands of DECA members who are already using DecA(I)de to prepare for competition success.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth">
                  <a className="px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-primary-50 transition shadow-lg hover:shadow-xl">
                    Get Started Today
                  </a>
                </Link>
                
                <Link href="/pricing">
                  <a className="px-8 py-3 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 transition border border-primary-600">
                    View Pricing Plans
                  </a>
                </Link>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="border-t border-slate-200 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-base">D</span>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    AI
                  </span>
                </div>
                <span className="font-heading font-bold text-base text-slate-800">DecA<span className="text-primary">(I)</span>de</span>
              </div>
              
              <div className="text-center md:text-right">
                <div className="text-sm text-slate-500">© 2023 DecA(I)de. All rights reserved.</div>
                <div className="text-xs text-slate-400 mt-1">Who says there is no I in team?</div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}