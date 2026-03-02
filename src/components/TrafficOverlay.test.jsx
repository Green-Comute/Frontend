/**
 * @fileoverview Tests for TrafficOverlay Component
 * @module components/TrafficOverlay.test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrafficOverlay, {
    IncidentMarkers,
    createIncidentIcon,
} from './TrafficOverlay';

// ─── Mock react-leaflet hooks & components ───────────────────────────────────
vi.mock('react-leaflet', () => ({
    TileLayer: ({ url, ...props }) => (
        <div data-testid="tile-layer" data-url={url} {...props} />
    ),
    Marker: ({ children, position }) => (
        <div data-testid="marker" data-position={position?.join(',')}>
            {children}
        </div>
    ),
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    useMap: () => ({
        getBounds: () => ({
            getSouth: () => 12.9,
            getWest: () => 77.5,
            getNorth: () => 13.1,
            getEast: () => 77.7,
        }),
    }),
    useMapEvents: () => null,
}));

// ─── Mock trafficService ─────────────────────────────────────────────────────
vi.mock('../services/trafficService', () => ({
    getTrafficFlowTileUrl: () =>
        'https://a.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?tileSize=256&key=test-key',
    fetchTrafficIncidents: vi.fn().mockResolvedValue([]),
    getBoundsFromMap: () => ({
        southLat: 12.9,
        westLng: 77.5,
        northLat: 13.1,
        eastLng: 77.7,
    }),
    isTrafficApiConfigured: () => true,
    getSeverityLabel: (n) => ['Unknown', 'Minor', 'Moderate', 'Major', 'Undefined'][n] || 'Unknown',
}));

// ─── Mock leaflet L.divIcon ─────────────────────────────────────────────────
vi.mock('leaflet', () => ({
    default: {
        divIcon: (opts) => opts,
    },
    divIcon: (opts) => opts,
}));

describe('TrafficOverlay Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // Rendering
    // ═══════════════════════════════════════════════════════════════════════════
    describe('rendering', () => {
        it('should render nothing when showTraffic and showIncidents are both false', () => {
            const { container } = render(
                <TrafficOverlay showTraffic={false} showIncidents={false} />
            );
            expect(container.innerHTML).toBe('');
        });

        it('should render TileLayer when showTraffic is true', () => {
            render(<TrafficOverlay showTraffic={true} showIncidents={false} />);
            const tileLayer = screen.getByTestId('tile-layer');
            expect(tileLayer).toBeInTheDocument();
            expect(tileLayer.dataset.url).toContain('tomtom.com/traffic');
        });

        it('should not render TileLayer when showTraffic is false', () => {
            render(<TrafficOverlay showTraffic={false} showIncidents={true} />);
            expect(screen.queryByTestId('tile-layer')).not.toBeInTheDocument();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // IncidentMarkers
    // ═══════════════════════════════════════════════════════════════════════════
    describe('IncidentMarkers', () => {
        const mockIncidents = [
            {
                id: 'inc-001',
                position: { lat: 12.97, lng: 77.59 },
                description: 'Accident on MG Road',
                category: 'Accident',
                icon: '🚨',
                color: '#EF4444',
                severity: 2,
                roadName: 'NH-44',
                delay: 600,
                delayText: '10 min delay',
                from: 'MG Road',
                to: 'Brigade Road',
            },
            {
                id: 'inc-002',
                position: { lat: 13.0, lng: 77.6 },
                description: 'Traffic jam',
                category: 'Jam',
                icon: '🚗',
                color: '#DC2626',
                severity: 3,
                roadName: 'Ring Road',
                delay: 1200,
                delayText: '20 min delay',
                from: 'Silk Board',
                to: 'Marathahalli',
            },
        ];

        it('should render markers for each incident', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            const markers = screen.getAllByTestId('marker');
            expect(markers).toHaveLength(2);
        });

        it('should render popups with incident details', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            const popups = screen.getAllByTestId('popup');
            expect(popups).toHaveLength(2);
        });

        it('should display incident category', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            expect(screen.getByText('Accident')).toBeInTheDocument();
            expect(screen.getByText('Jam')).toBeInTheDocument();
        });

        it('should display incident description', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            expect(screen.getByText('Accident on MG Road')).toBeInTheDocument();
            expect(screen.getByText('Traffic jam')).toBeInTheDocument();
        });

        it('should display road name', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            expect(screen.getByText('📍 NH-44')).toBeInTheDocument();
            expect(screen.getByText('📍 Ring Road')).toBeInTheDocument();
        });

        it('should display delay text', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            expect(screen.getByText('10 min delay')).toBeInTheDocument();
            expect(screen.getByText('20 min delay')).toBeInTheDocument();
        });

        it('should display from/to information', () => {
            render(<IncidentMarkers incidents={mockIncidents} />);
            expect(screen.getByText('From: MG Road')).toBeInTheDocument();
            expect(screen.getByText('To: Brigade Road')).toBeInTheDocument();
        });

        it('should render nothing for empty incidents array', () => {
            const { container } = render(<IncidentMarkers incidents={[]} />);
            expect(container.innerHTML).toBe('');
        });

        it('should render nothing for null incidents', () => {
            const { container } = render(<IncidentMarkers incidents={null} />);
            expect(container.innerHTML).toBe('');
        });

        it('should not display road name when it is Unknown road', () => {
            const incidents = [
                {
                    id: 'inc-003',
                    position: { lat: 13.0, lng: 77.5 },
                    description: 'Construction',
                    category: 'Road Works',
                    icon: '🔧',
                    color: '#D97706',
                    severity: 1,
                    roadName: 'Unknown road',
                    delay: 0,
                    delayText: 'No delay',
                    from: '',
                    to: '',
                },
            ];

            render(<IncidentMarkers incidents={incidents} />);
            expect(screen.queryByText('📍 Unknown road')).not.toBeInTheDocument();
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // createIncidentIcon
    // ═══════════════════════════════════════════════════════════════════════════
    describe('createIncidentIcon', () => {
        it('should create an icon with the correct emoji and colour', () => {
            const icon = createIncidentIcon('🚨', '#EF4444');
            expect(icon.html).toContain('🚨');
            expect(icon.html).toContain('#EF4444');
        });

        it('should have correct icon size', () => {
            const icon = createIncidentIcon('🚗', '#DC2626');
            expect(icon.iconSize).toEqual([30, 30]);
        });

        it('should have correct anchor points', () => {
            const icon = createIncidentIcon('⚠️', '#F59E0B');
            expect(icon.iconAnchor).toEqual([15, 15]);
            expect(icon.popupAnchor).toEqual([0, -18]);
        });

        it('should have the traffic-incident-icon class', () => {
            const icon = createIncidentIcon('🚧', '#F97316');
            expect(icon.className).toBe('traffic-incident-icon');
        });
    });
});
