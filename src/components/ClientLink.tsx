import React from 'react';
import { Link } from 'react-router-dom';

interface ClientLinkProps {
  clientId: string;
}

export function ClientLink({ clientId }: ClientLinkProps) {
  return (
    <Link 
      to={`/clients/${clientId}`}
      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      View Oracle Dashboard
    </Link>
  );
}