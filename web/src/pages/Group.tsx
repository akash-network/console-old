import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Group(props: any) {
  const { name, deployments } = props;
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl">Active Group</h1>
      <h2 className="text-xl">{name}</h2>
      <h3 className="text-lg">Deployments</h3>
      <ul className="ml-4">
        {deployments.map((deployment: any) => (
          <li key={deployment.name}>
            <Link to={deployment.path}>{deployment.name}</Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  );
}
