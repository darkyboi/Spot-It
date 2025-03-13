
import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import Button from './common/Button';

interface SpotNotificationActionsProps {
  onBlock: () => void;
  onReportAbuse: () => void;
}

const SpotNotificationActions: React.FC<SpotNotificationActionsProps> = ({ 
  onBlock,
  onReportAbuse
}) => {
  return (
    <div className="flex items-center space-x-2 mt-4">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Shield size={14} />}
        onClick={onBlock}
        className="text-xs text-gray-500 hover:text-destructive"
      >
        Block Sender
      </Button>
      
      <div className="h-4 w-px bg-gray-200" />
      
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<AlertTriangle size={14} />}
        onClick={onReportAbuse}
        className="text-xs text-gray-500"
      >
        Report Abuse
      </Button>
    </div>
  );
};

export default SpotNotificationActions;
