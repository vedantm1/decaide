import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Check for WebGL support
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

interface Simple3DBackgroundProps {
  colorScheme?: string;
}

const Simple3DBackground: React.FC<Simple3DBackgroundProps> = ({ 
  colorScheme = 'aquaBlue' 
}) => {
  const [hasWebGL] = useState(isWebGLAvailable());
  
  // If WebGL is not available, render a simple gradient background
  if (!hasWebGL) {
    const getPrimaryGradient = () => {
      const colors: Record<string, string> = {
        'aquaBlue': 'linear-gradient(45deg, #1e3a8a 0%, #3b82f6 100%)',
        'coralPink': 'linear-gradient(45deg, #831843 0%, #ec4899 100%)',
        'mintGreen': 'linear-gradient(45deg, #14532d 0%, #22c55e 100%)',
        'royalPurple': 'linear-gradient(45deg, #581c87 0%, #8b5cf6 100%)',
      };
      return colors[colorScheme] || colors.aquaBlue;
    };
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -10,
          background: getPrimaryGradient(),
          opacity: 0.4
        }}
      />
    );
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Mesh[]>([]);
  
  // Get primary color based on color scheme
  const getPrimaryColor = () => {
    const colors: Record<string, string> = {
      'aquaBlue': '#3b82f6',
      'coralPink': '#ec4899',
      'mintGreen': '#22c55e',
      'royalPurple': '#8b5cf6',
    };
    return colors[colorScheme] || colors.aquaBlue;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;
    
    // Renderer setup
    try {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'default'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      
      // Clear container and add canvas
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(renderer.domElement);
      }
      rendererRef.current = renderer;
      
      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);
      
      // Objects
      const objects: THREE.Mesh[] = [];
      const primaryColor = new THREE.Color(getPrimaryColor());
      
      // Create objects
      for (let i = 0; i < 15; i++) {
        const geometry = i % 2 === 0 
          ? new THREE.BoxGeometry(1, 1, 1)
          : new THREE.SphereGeometry(0.5, 32, 32);
          
        const material = new THREE.MeshStandardMaterial({
          color: primaryColor.clone().multiplyScalar(0.5 + Math.random() * 0.5),
          metalness: 0.2,
          roughness: 0.8,
          transparent: true,
          opacity: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position randomly in a sphere
        const radius = 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
        mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
        mesh.position.z = radius * Math.cos(phi) - 10;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        scene.add(mesh);
        objects.push(mesh);
      }
      
      objectsRef.current = objects;
      
      // Grid for reference
      const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x555555);
      gridHelper.position.y = -5;
      scene.add(gridHelper);
      
      // Handle window resize
      const handleResize = () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animation loop
      const animate = () => {
        if (objects.length > 0 && scene && camera && renderer) {
          objects.forEach((mesh, i) => {
            mesh.rotation.x += 0.002 * (i % 5 + 1) / 5;
            mesh.rotation.y += 0.003 * (i % 3 + 1) / 3;
            
            // Subtle floating motion
            mesh.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
          });
          
          renderer.render(scene, camera);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        
        // Clean up geometries and materials
        objects.forEach(mesh => {
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(material => material.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      };
    } catch (error) {
      console.error('Error initializing Three.js environment:', error);
      return () => {}; // Return empty cleanup function
    }
  }, []); // Empty dependency array - only run once
  
  // Update colors when colorScheme changes
  useEffect(() => {
    if (objectsRef.current.length === 0) return;
    
    const primaryColor = new THREE.Color(getPrimaryColor());
    
    objectsRef.current.forEach(mesh => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (material) {
        material.color = primaryColor.clone().multiplyScalar(0.5 + Math.random() * 0.5);
      }
    });
  }, [colorScheme]);
  
  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -10,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  );
};

export default Simple3DBackground;