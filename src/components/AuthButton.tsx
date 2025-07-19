
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function AuthButton() {
  return (
    <div className="flex items-center gap-4">
      <Link to="/auth">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          Login
        </Button>
      </Link>
      <Link to="/auth">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Sign Up
        </Button>
      </Link>
    </div>
  );
}
