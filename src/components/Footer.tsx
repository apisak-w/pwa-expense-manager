import React from 'react';
import dayjs from 'dayjs';

export function Footer(): React.JSX.Element {
  const buildTime = dayjs(__BUILD_TIME__).format('YYYY-MM-DD HH:mm:ss');
  const buildNumber = __GITHUB_BUILD_NUMBER__;

  return (
    <footer className="mt-12 py-6 border-t text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center gap-1">
        {buildNumber && <span>Build No: {buildNumber}</span>}
        <p className="text-xs opacity-70">Last deployed: {buildTime}</p>
      </div>
    </footer>
  );
}
