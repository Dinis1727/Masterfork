import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../Contact';

describe('Contact form', () => {
  let alertSpy;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('allows the user to fill and submit the contact form', async () => {
    render(<Contact />);

    const user = userEvent.setup();
    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const messageInput = screen.getByLabelText(/mensagem/i);
    const submitButton = screen.getByRole('button', { name: /enviar/i });

    await user.type(nameInput, 'Maria');
    await user.type(emailInput, 'maria@example.com');
    await user.type(messageInput, 'Gostaria de saber mais.');

    expect(nameInput).toHaveValue('Maria');
    expect(emailInput).toHaveValue('maria@example.com');
    expect(messageInput).toHaveValue('Gostaria de saber mais.');

    await user.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith('Obrigado, Maria! Recebemos sua mensagem.');
    expect(nameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
  });

  it('prevents submission when required fields are empty', async () => {
    render(<Contact />);

    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /enviar/i });

    await user.click(submitButton);

    expect(alertSpy).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/nome/i)).toBeInvalid();
    expect(screen.getByLabelText(/e-mail/i)).toBeInvalid();
    expect(screen.getByLabelText(/mensagem/i)).toBeInvalid();
  });
});
