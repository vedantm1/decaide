declare module 'vanta/dist/vanta.waves.min' {
  const WAVES: {
    default: (options: {
      el: HTMLElement;
      THREE: any;
      mouseControls: boolean;
      touchControls: boolean;
      gyroControls: boolean;
      minHeight: number;
      minWidth: number;
      scale: number;
      scaleMobile: number;
      color: number;
      shininess: number;
      waveHeight: number;
      waveSpeed: number;
      zoom: number;
    }) => {
      destroy: () => void;
    };
  };
  export default WAVES;
}