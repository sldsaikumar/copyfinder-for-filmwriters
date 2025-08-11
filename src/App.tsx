import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Search, Film, Sparkles, Zap, Star, Play, Calendar, Users, Award, Globe } from 'lucide-react';

const CinePlotAnalyzer = () => {
  const [plotText, setPlotText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentStep, setCurrentStep] = useState('input'); // input, analyzing, results
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  // 3D Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    sceneRef.current = { scene, camera, renderer };

    // Create floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.8, 1, 0.5);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Create film reel geometry
    const filmReelGeometry = new THREE.TorusGeometry(5, 2, 8, 100);
    const filmReelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    for (let i = 0; i < 5; i++) {
      const filmReel = new THREE.Mesh(filmReelGeometry, filmReelMaterial);
      filmReel.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      filmReel.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      scene.add(filmReel);
    }

    camera.position.z = 30;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Rotate particles
      particles.rotation.y = time * 0.1;
      particles.rotation.x = time * 0.05;
      
      // Animate film reels
      scene.children.forEach((child, index) => {
        if (child.geometry?.type === 'TorusGeometry') {
          child.rotation.x += 0.01 + index * 0.001;
          child.rotation.y += 0.01 + index * 0.001;
          child.position.y = Math.sin(time + index) * 2;
        }
      });
      
      // Camera movement
      camera.position.x = Math.sin(time * 0.2) * 5;
      camera.position.y = Math.cos(time * 0.15) * 3;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const analyzePlot = async () => {
    if (!plotText.trim() || plotText.length < 50) {
      alert('Please enter at least 50 characters for a meaningful analysis.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep('analyzing');
    setAnalysisStartTime(Date.now());
    setLoadingProgress(0);

    // Progress simulation with loading text
    const loadingSteps = [
      "Parsing plot elements...",
      "Extracting themes and motifs...",
      "Analyzing character archetypes...",
      "Identifying narrative structure...",
      "Searching global cinema database...",
      "Matching with Bollywood films...",
      "Scanning Korean cinema...",
      "Checking European films...",
      "Analyzing Japanese cinema...",
      "Reviewing world cinema...",
      "Calculating similarity scores...",
      "Finalizing results..."
    ];

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) currentProgress = 90;
        
        setLoadingProgress(Math.floor(currentProgress));
        const stepIndex = Math.floor((currentProgress / 100) * loadingSteps.length);
        if (loadingSteps[stepIndex]) {
          setLoadingText(loadingSteps[stepIndex]);
        }
      }
    }, 800);

    // Timeout after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setCurrentStep('input');
      alert('Analysis timed out. Please try with a shorter or simpler plot description.');
    }, 30000);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY || '', // Add your key in Vercel env vars
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: `Analyze this plot/storyline and find similar films from cinema history worldwide. Focus on plot structure, themes, character archetypes, and narrative elements.

Plot to analyze:
"${plotText}"

IMPORTANT: You MUST include films from ALL languages and countries - Bollywood, Tollywood, Korean cinema, Japanese anime/films, French cinema, Italian cinema, Russian films, Chinese cinema, Thai films, Iranian cinema, Mexican films, Brazilian cinema, African cinema, and ALL other world cinema. Do NOT focus only on Hollywood films.

Respond ONLY with a valid JSON object in this exact format (no markdown, no backticks, no extra text):
{
  "plotAnalysis": {
    "mainThemes": ["theme1", "theme2", "theme3"],
    "plotStructure": "description of the narrative structure",
    "characterArchetypes": ["archetype1", "archetype2"],
    "genre": "primary genre",
    "mood": "overall mood/tone",
    "conflictType": "type of central conflict"
  },
  "similarFilms": [
    {
      "title": "Film Title (Original Title if different)",
      "year": 2020,
      "director": "Director Name",
      "genre": "Genre",
      "language": "Original Language",
      "similarityScore": 85,
      "matchingElements": ["element1", "element2", "element3"],
      "plotSummary": "Brief plot summary",
      "whySimilar": "Detailed explanation of similarities",
      "country": "Country of origin",
      "rating": "IMDb/RT rating if known",
      "internationalTitle": "English title if different from original"
    }
  ]
}

Find at least 8-12 similar films with DIVERSE representation from:
- Indian cinema (Bollywood, Tollywood, Kollywood, Mollywood)
- East Asian cinema (Korea, Japan, China, Thailand)
- European cinema (France, Italy, Germany, Russia, UK)
- Latin American cinema (Mexico, Brazil, Argentina)
- Middle Eastern and African cinema
- Other regional cinemas

Prioritize including films from AT LEAST 6 different countries/languages. Make similarity scores realistic (60-95%). Focus on genuine plot and thematic similarities across ALL world cinema, not just Hollywood.`
            }
          ]
        })
      });

      clearTimeout(timeout);
      clearInterval(progressInterval);
      
      setLoadingProgress(95);
      setLoadingText("Processing results...");

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response format from API');
      }
      
      let responseText = data.content[0].text;
      
      // Clean up response - handle multiple possible formats
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      // Find JSON content if wrapped in other text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      setLoadingProgress(100);
      setLoadingText("Analysis complete!");
      
      const results = JSON.parse(responseText);
      
      // Validate results structure
      if (!results.plotAnalysis || !results.similarFilms || !Array.isArray(results.similarFilms)) {
        throw new Error('Invalid results structure');
      }
      
      // Sort by similarity score
      results.similarFilms.sort((a, b) => b.similarityScore - a.similarityScore);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setAnalysisResults(results);
        setCurrentStep('results');
      }, 500);
      
    } catch (error) {
      clearTimeout(timeout);
      clearInterval(progressInterval);
      console.error('Analysis error:', error);
      
      let errorMessage = 'Analysis failed. ';
      if (error.message.includes('timeout') || error.message.includes('failed')) {
        errorMessage += 'The server might be busy. Please try again in a moment.';
      } else if (error.message.includes('JSON')) {
        errorMessage += 'There was an issue processing the results. Please try with a different plot.';
      } else {
        errorMessage += 'Please try again with a different plot description.';
      }
      
      alert(errorMessage);
      setCurrentStep('input');
    }
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setCurrentStep('input');
    setAnalysisResults(null);
    setPlotText('');
    setLoadingProgress(0);
    setLoadingText('');
    setAnalysisStartTime(null);
  };

  const getSimilarityColor = (score) => {
    if (score >= 90) return 'text-red-400';
    if (score >= 80) return 'text-orange-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-green-400';
    return 'text-blue-400';
  };

  const getSimilarityBg = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-red-600/20 to-red-400/20';
    if (score >= 80) return 'bg-gradient-to-r from-orange-600/20 to-orange-400/20';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-600/20 to-yellow-400/20';
    if (score >= 60) return 'bg-gradient-to-r from-green-600/20 to-green-400/20';
    return 'bg-gradient-to-r from-blue-600/20 to-blue-400/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 3D Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Overlay gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60 z-10" />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen">
        {currentStep === 'input' && (
          <div className="container mx-auto px-4 py-20">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="relative inline-block">
                <h1 className="text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                  CinePlot Analyzer
                </h1>
                <div className="absolute -top-4 -right-4 animate-pulse">
                  <Sparkles className="text-yellow-400 w-8 h-8" />
                </div>
              </div>
              <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover films with similar plots to your story from ALL world cinema - Bollywood, K-Cinema, European, Latin American & more
              </p>
                <div className="flex justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Global Cinema • All Languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>AI-Powered Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Film className="w-5 h-5" />
                  <span>World Cinema Database</span>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
                <div className="mb-6">
                  <label className="block text-xl font-semibold text-white mb-4">
                    Enter Your Plot, Story Idea, or Concept
                  </label>
                  <div className="relative">
                    <textarea
                      value={plotText}
                      onChange={(e) => setPlotText(e.target.value)}
                      placeholder="Describe your plot, storyline, or story idea here... (minimum 50 characters for meaningful analysis)"
                      className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 text-lg leading-relaxed resize-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                      maxLength={2000}
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                      {plotText.length}/2000
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={analyzePlot}
                    disabled={isAnalyzing || plotText.trim().length < 50}
                    className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-2xl"
                  >
                    <div className="flex items-center space-x-3">
                      <Search className="w-6 h-6" />
                      <span>Analyze Plot Similarities</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'analyzing' && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="relative mb-12">
                <div className="w-40 h-40 mx-auto relative">
                  <div className="absolute inset-0 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
                  <div className="absolute inset-2 border-4 border-pink-600 rounded-full animate-spin border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-4 border-4 border-cyan-600 rounded-full animate-spin border-r-transparent" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-16 h-16 text-white animate-pulse" />
                  </div>
                </div>
                
                {/* Progress Circle */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${loadingProgress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{loadingProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-6">Analyzing Your Plot</h2>
              <p className="text-2xl text-gray-300 mb-8">Searching through global cinema database...</p>
              
              {/* Current Action */}
              <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 mb-8">
                <div className="text-xl text-purple-300 font-semibold mb-4">Current Status:</div>
                <div className="text-lg text-white animate-pulse">{loadingText || "Initializing analysis..."}</div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-3 mb-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              
              {/* Time Elapsed */}
              {analysisStartTime && (
                <div className="text-gray-400 text-sm">
                  Time elapsed: {Math.floor((Date.now() - analysisStartTime) / 1000)}s
                </div>
              )}
              
              {/* Loading Steps Preview */}
              <div className="mt-8 space-y-2 text-left max-w-md mx-auto">
                <div className="text-gray-300 text-sm mb-3">Analysis includes:</div>
                {[
                  "🎭 Bollywood & Indian Cinema",
                  "🇰🇷 Korean Films & K-Drama",
                  "🇯🇵 Japanese Cinema & Anime", 
                  "🇫🇷 European Art Films",
                  "🌎 Latin American Cinema",
                  "🌍 African & Middle Eastern Films"
                ].map((text, index) => (
                  <div key={index} className={`text-sm transition-all duration-300 ${
                    loadingProgress > (index + 1) * 15 
                      ? 'text-green-400' 
                      : loadingProgress > index * 15 
                        ? 'text-yellow-400 animate-pulse' 
                        : 'text-gray-500'
                  }`}>
                    {text}
                  </div>
                ))}
              </div>

              {/* Cancel Button */}
              <button
                onClick={resetAnalysis}
                className="mt-8 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-all duration-300"
              >
                Cancel Analysis
              </button>
            </div>
          </div>
        )}

        {currentStep === 'results' && analysisResults && (
          <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Analysis Complete!
              </h2>
              <p className="text-xl text-gray-300">Found {analysisResults.similarFilms.length} similar films</p>
              <button
                onClick={resetAnalysis}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300"
              >
                Analyze Another Plot
              </button>
            </div>

            {/* Plot Analysis Summary */}
            <div className="mb-12 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Sparkles className="mr-3 text-yellow-400" />
                Your Plot Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold text-purple-300 mb-3">Main Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.plotAnalysis.mainThemes.map((theme, index) => (
                      <span key={index} className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-pink-300 mb-3">Character Archetypes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.plotAnalysis.characterArchetypes.map((archetype, index) => (
                      <span key={index} className="bg-pink-600/30 text-pink-200 px-3 py-1 rounded-full text-sm">
                        {archetype}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-cyan-300 mb-3">Genre & Mood</h4>
                  <p className="text-gray-300">{analysisResults.plotAnalysis.genre} • {analysisResults.plotAnalysis.mood}</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-green-300 mb-3">Plot Structure</h4>
                  <p className="text-gray-300">{analysisResults.plotAnalysis.plotStructure}</p>
                </div>
              </div>
            </div>

            {/* Similar Films */}
            <div className="space-y-8">
              {analysisResults.similarFilms.map((film, index) => (
                <div
                  key={index}
                  className={`${getSimilarityBg(film.similarityScore)} backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">{film.title}</h3>
                      <div className="flex items-center space-x-4 text-gray-300">
                        <span className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          {film.year}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          {film.director}
                        </span>
                        <span className="flex items-center">
                          <Film className="w-5 h-5 mr-2" />
                          {film.genre}
                        </span>
                        {film.country && (
                          <span className="flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            {film.country}
                          </span>
                        )}
                        {film.rating && (
                          <span className="flex items-center">
                            <Star className="w-5 h-5 mr-2" />
                            {film.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getSimilarityColor(film.similarityScore)} mb-2`}>
                        {film.similarityScore}%
                      </div>
                      <div className="text-gray-400 text-sm">Similarity</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Plot Summary</h4>
                      <p className="text-gray-300 leading-relaxed">{film.plotSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Why It's Similar</h4>
                      <p className="text-gray-300 leading-relaxed mb-4">{film.whySimilar}</p>
                      <h5 className="text-lg font-semibold text-white mb-2">Matching Elements</h5>
                      <div className="flex flex-wrap gap-2">
                        {film.matchingElements.map((element, idx) => (
                          <span key={idx} className="bg-gray-700/50 text-gray-200 px-3 py-1 rounded-full text-sm">
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinePlotAnalyzer;