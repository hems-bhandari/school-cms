'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeOutCubic * end)

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])

  return (
    <span className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

interface StatsCardProps {
  icon: React.ReactNode
  value: number
  suffix?: string
  prefix?: string
  label: string
  description: string
}

export function StatsCard({ icon, value, suffix, prefix, label, description }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
          {icon}
        </div>
        <Sparkles className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="space-y-2">
        <AnimatedCounter end={value} suffix={suffix} prefix={prefix} />
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  buttonText: string
  gradient: string
}

export function FeatureCard({ icon, title, description, href, buttonText, gradient }: FeatureCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed mb-6">
          {description}
        </p>
        
        <a
          href={href}
          className={`inline-flex items-center space-x-2 bg-gradient-to-r ${gradient} text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </a>
      </div>
    </div>
  )
}
