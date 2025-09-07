// Jest Setup File - Global test configuration
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(() => ({
    type: 'sine',
    frequency: { value: 440 },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    onended: null,
  })),
  createGain: jest.fn(() => ({
    gain: {
      value: 1,
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  })),
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0.8,
    connect: jest.fn(),
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn(),
  })),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
  currentTime: 0,
  state: 'running',
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  suspend: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
}));

// Mock MediaDevices API
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn(),
      kind: 'audio',
    }],
  }),
  enumerateDevices: jest.fn().mockResolvedValue([]),
};

// Mock Vibration API
global.navigator.vibrate = jest.fn(() => true);

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Suppress console errors in tests (optional)
if (process.env.SUPPRESS_TEST_CONSOLE) {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
  };
}