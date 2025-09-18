declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': {
      ref?: React.Ref<any>;
      src?: string;
      alt?: string;
      'auto-rotate'?: boolean;
      'camera-controls'?: boolean;
      'ar'?: boolean;
      'ar-modes'?: string;
      'ar-scale'?: string;
      'ar-placement'?: string;
      'ios-src'?: string;
      'touch-action'?: string;
      'disable-zoom'?: boolean;
      'interaction-policy'?: string;
      'interaction-prompt'?: string;
      'interaction-prompt-threshold'?: number;
      'camera-orbit'?: string;
      'camera-target'?: string;
      'field-of-view'?: string;
      'min-camera-orbit'?: string;
      'max-camera-orbit'?: string;
      'min-field-of-view'?: string;
      'max-field-of-view'?: string;
      'environment-image'?: string;
      'skybox-image'?: string;
      'shadow-intensity'?: number;
      'shadow-softness'?: number;
      'exposure'?: number;
      'tone-mapping'?: string;
      'poster'?: string;
      'loading'?: string;
      'reveal'?: string;
      'background-color'?: string;
      'environment-image'?: string;
      'skybox-image'?: string;
      'shadow-intensity'?: number;
      'shadow-softness'?: number;
      'exposure'?: number;
      'tone-mapping'?: string;
      'poster'?: string;
      'loading'?: string;
      'reveal'?: string;
      'background-color'?: string;
      style?: React.CSSProperties;
      className?: string;
      children?: React.ReactNode;
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'model-viewer': HTMLElement & {
      activateAR(): void;
      src: string;
      alt: string;
      'auto-rotate': boolean;
      'camera-controls': boolean;
      'ar': boolean;
      'ar-modes': string;
      'ar-scale': string;
      'ar-placement': string;
      'ios-src': string;
      'touch-action': string;
      'disable-zoom': boolean;
      'interaction-policy': string;
      'interaction-prompt': string;
      'interaction-prompt-threshold': number;
      'camera-orbit': string;
      'camera-target': string;
      'field-of-view': string;
      'min-camera-orbit': string;
      'max-camera-orbit': string;
      'min-field-of-view': string;
      'max-field-of-view': string;
      'environment-image': string;
      'skybox-image': string;
      'shadow-intensity': number;
      'shadow-softness': number;
      'exposure': number;
      'tone-mapping': string;
      'poster': string;
      'loading': string;
      'reveal': string;
      'background-color': string;
    };
  }
}



