
import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

const MapComponent = ({ bins = [], zones = [], showHeatmap = false }) => {
  const getStatusColor = (fillLevel) => {
    if (fillLevel >= 80) return 'bg-warning-orange';
    if (fillLevel >= 50) return 'bg-civic-champion';
    return 'bg-success-green';
  };

  const getStatusLabel = (fillLevel) => {
    if (fillLevel >= 80) return 'Critical';
    if (fillLevel >= 50) return 'Medium';
    return 'Stable';
  };

  return (
    <div className="bg-background-dark rounded-2xl p-6 border border-border">
      <div className="aspect-video bg-muted rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background-darker to-background-dark opacity-50"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-accent-green mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Interactive Map View</p>
            <p className="text-sm text-muted-foreground">OpenStreetMap integration</p>
          </div>
        </div>

        {bins.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 bg-background-darker/90 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-accent-green" />
              <span className="text-sm font-medium text-foreground">Bin Status Legend</span>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning-orange"></div>
                <span className="text-muted-foreground">Critical (&gt;80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-civic-champion"></div>
                <span className="text-muted-foreground">Medium (50-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-green"></div>
                <span className="text-muted-foreground">Stable (&lt;50%)</span>
              </div>
            </div>
          </div>
        )}

        {showHeatmap && (
          <div className="absolute top-4 right-4 bg-background-darker/90 backdrop-blur-sm rounded-xl px-4 py-2">
            <span className="text-xs font-medium text-accent-green">Heatmap: Ghost-Scheduled Areas</span>
          </div>
        )}
      </div>

      {bins.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bins.slice(0, 6).map((bin) => (
            <div key={bin.id} className="bg-muted rounded-lg p-3 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(bin.fill_level)}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{bin.street_location || 'Unknown Location'}</p>
                <p className="text-xs text-muted-foreground">{bin.fill_level}% - {getStatusLabel(bin.fill_level)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
