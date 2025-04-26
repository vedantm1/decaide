import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface Simple3DBackgroundProps {
  colorScheme?: string;
}

const Simple3DBackground: React.FC<Simple3DBackgroundProps> = ({ 
  colorScheme = 'aquaBlue' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
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
    
    // Clean up previous renderer if it exists
    const cleanup = () => {
      if (renderer) {
        renderer.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    
    // Init scene, camera, and renderer
    const initThree = () => {
      try {
        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(
          75, 
          window.innerWidth / window.innerHeight, 
          0.1, 
          1000
        );
        camera.position.z = 10;
        cameraRef.current = camera;
        
        // Create renderer with antialias and transparent background
        const newRenderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'default'
        });
        newRenderer.setSize(window.innerWidth, window.innerHeight);
        newRenderer.setClearColor(0x000000, 0); // Transparent background
        
        // Clear container and add new renderer
        if (containerRef.current) {
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
          containerRef.current.appendChild(newRenderer.domElement);
        }
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);
        
        // Add 3D objects
        const objects: THREE.Mesh[] = [];
        const primaryColor = new THREE.Color(getPrimaryColor());
        
        // Create a grid of cubes
        for (let i = 0; i < 20; i++) {
          const geometry = i % 2 === 0 
            ? new THREE.BoxGeometry(1, 1, 1)
            : new THREE.SphereGeometry(0.5, 32, 32);
            
          const material = new THREE.MeshStandardMaterial({
            color: primaryColor.clone().multiplyScalar(0.5 + Math.random() * 0.5),
            metalness: 0.2,
            roughness: 0.8,
            transparent: true,
            opacity: 0.6
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position randomly in a sphere
          const radius = 15;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          
          mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
          mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
          mesh.position.z = radius * Math.cos(phi) - 10; // Push back a bit
          
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
          if (!cameraRef.current || !newRenderer) return;
          
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          newRenderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        const animate = () => {
          if (!sceneRef.current || !cameraRef.current || !newRenderer) return;
          
          objectsRef.current.forEach((mesh, i) => {
            mesh.rotation.x += 0.002 * (i % 5 + 1) / 5;
            mesh.rotation.y += 0.003 * (i % 3 + 1) / 3;
            
            // Subtle floating motion
            mesh.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
          });
          
          newRenderer.render(sceneRef.current, cameraRef.current);
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Return cleanup function
        return {
          renderer: newRenderer,
          cleanupFn: () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
          }
        };
      } catch (error) {
        console.error('Error initializing Three.js:', error);
        return { renderer: null, cleanupFn: () => {} };
      }
    };
    
    // Clean up first
    cleanup();
    
    // Initialize Three.js setup
    const { renderer: newRenderer, cleanupFn } = initThree();
    
    // Only update renderer state if it changed
    if (newRenderer !== renderer) {
      setRenderer(newRenderer);
    }
    
    // Return cleanup
    return cleanupFn;
  }, [colorScheme]);
  
  // Update colors when colorScheme changes
  useEffect(() => {
    if (!objectsRef.current.length) return;
    
    const primaryColor = new THREE.Color(getPrimaryColor());
    
    objectsRef.current.forEach((mesh) => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.color = primaryColor.clone().multiplyScalar(0.5 + Math.random() * 0.5);
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