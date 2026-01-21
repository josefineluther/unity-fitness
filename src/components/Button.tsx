type ButtonProps = {
  text: string
  color?: 'light' | 'dark' | 'primary'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

function Button({ text, onClick, color = 'dark' }: ButtonProps) {
  return (
    <button className={`button ${color}`} onClick={onClick}>
      {text}
    </button>
  )
}

export default Button
