
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.czshkxhydilxhvptawoc',
  appName: 'Spot It',
  webDir: 'dist',
  server: {
    url: 'https://czshkxhydilxhvptawoc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
