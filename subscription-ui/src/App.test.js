import { render, screen } from '@testing-library/react';
import App from './App';

test('renders subscription plans heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Choose Your Plan/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders all subscription plans', () => {
  render(<App />);
  
  // Check for plan names
  expect(screen.getByText(/Basic Plan/i)).toBeInTheDocument();
  expect(screen.getByText(/Pro Plan/i)).toBeInTheDocument();
  expect(screen.getByText(/Premium Plan/i)).toBeInTheDocument();
  
  // Check for prices
  expect(screen.getByText(/199/)).toBeInTheDocument();
  expect(screen.getByText(/499/)).toBeInTheDocument();
  expect(screen.getByText(/999/)).toBeInTheDocument();
});

test('renders subscribe buttons', () => {
  render(<App />);
  const subscribeButtons = screen.getAllByText(/Subscribe/i);
  expect(subscribeButtons).toHaveLength(3);
});
