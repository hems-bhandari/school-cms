'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import { useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { createClient } from '@/lib/supabase-client'
import { generateSchoolSchema } from '@/lib/seo'
import SEOSchema from '@/components/SEOSchema'
import { StatsCard, FeatureCard } from '@/components/LandingComponents'
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Bell, 
  BookOpen, 
  Award,
  TrendingUp,
  Heart,
  ArrowRight,
  MapPin,
  ChevronDown
} from 'lucide-react'

interface FooterData {
  school_name_en: string
  school_name_ne: string
  address_en: string
  address_ne: string
  phone: string
  email: string
  logo_url?: string
  facebook_url?: string
  twitter_url?: string
  instagram_url?: string
  youtube_url?: string
  linkedin_url?: string
}

export default function Home() {
  const { locale } = useLanguage()
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [stats, setStats] = useState({
    students: 1200,
    teachers: 45,
    activities: 25,
    successRate: 98
  })

  useEffect(() => {
    async function fetchSchoolData() {
      const supabase = createClient()
      const { data } = await supabase
        .from('footer')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (data) {
        setFooterData(data)
      }

      // Fetch real stats from database
      const [
        { count: teachersCount },
        { count: activitiesCount }
      ] = await Promise.all([
        supabase.from('teachers').select('*', { count: 'exact' }).eq('is_active', true),
        supabase.from('activities').select('*', { count: 'exact' }).eq('is_published', true)
      ])

      setStats({
        students: 1200, // This could come from a students table
        teachers: teachersCount || 45,
        activities: activitiesCount || 25,
        successRate: 98
      })
    }
    fetchSchoolData()
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* SEO Schema.org structured data */}
      {footerData && (
        <SEOSchema schema={generateSchoolSchema(footerData, locale)} />
      )}
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Shree Jana Jagriti Secondary School
              </span>

            </h1>
            
            {/* Location */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-lg text-gray-600">Omsatiya-1, Rupandehi, Lumbini, Nepal</span>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Empowering minds, building futures. Discover our commitment to excellence in education with modern facilities and dedicated faculty.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/about"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Explore</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              {/* <Link 
                href="/admin"
                className="group bg-white text-gray-900 px-8 py-4 rounded-2xl hover:bg-gray-50 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-gray-300"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Admin Portal</span>
              </Link> */}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <StatsCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                value={stats.students}
                suffix="+"
                label="Students"
                description="Active learners in our community"
              />
              <StatsCard
                icon={<GraduationCap className="w-6 h-6 text-green-600" />}
                value={stats.teachers}
                suffix="+"
                label="Teachers"
                description="Dedicated faculty members"
              />
              <StatsCard
                icon={<Calendar className="w-6 h-6 text-purple-600" />}
                value={stats.activities}
                suffix="+"
                label="Activities"
                description="Engaging programs & events"
              />
              <StatsCard
                icon={<Award className="w-6 h-6 text-yellow-600" />}
                value={stats.successRate}
                suffix="%"
                label="Success Rate"
                description="Student achievement rate"
              />
            </div>

            {/* Scroll indicator */}
            <button 
              onClick={scrollToFeatures}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 animate-bounce"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Explore 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive school management system designed for modern education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8 text-white" />}
              title="Faculty & Staff"
              description="Meet our dedicated teachers and staff members who are committed to providing quality education."
              href="/teachers"
              buttonText="Meet Our Teachers"
              gradient="from-blue-500 to-blue-600"
            />
            
            <FeatureCard
              icon={<Calendar className="w-8 h-8 text-white" />}
              title="School Activities"
              description="Discover exciting activities, events, and programs that enhance student learning and development."
              href="/activities"
              buttonText="View Activities"
              gradient="from-green-500 to-green-600"
            />
            
            <FeatureCard
              icon={<Bell className="w-8 h-8 text-white" />}
              title="Latest Notices"
              description="Stay updated with important announcements, news, and information for students and parents."
              href="/notices"
              buttonText="Read Notices"
              gradient="from-purple-500 to-purple-600"
            />
            
            <FeatureCard
              icon={<BookOpen className="w-8 h-8 text-white" />}
              title="About Our School"
              description="Learn about our mission, vision, values, and the comprehensive statistics of our institution."
              href="/about"
              buttonText="Learn More"
              gradient="from-indigo-500 to-indigo-600"
            />
            
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-white" />}
              title="School Committee"
              description="Get to know our leadership team and committee members who guide our educational excellence."
              href="/committee"
              buttonText="Meet Committee"
              gradient="from-pink-500 to-pink-600"
            />
            
            {/* <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Admin Dashboard"
              description="Comprehensive management tools for administrators to efficiently manage school operations."
              href="/admin"
              buttonText="Access Dashboard"
              gradient="from-gray-600 to-gray-700"
            /> */}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      {/* <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join our educational community and experience excellence in learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Learn More About Us
            </Link>
            <Link
              href="/admin/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transform hover:-translate-y-1 transition-all duration-300"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
