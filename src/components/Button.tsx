type ButtonProps = {
  text: string
  color?: 'light' | 'dark'
  onClick?: () => void
}

function Button({ text, onClick, color = 'dark' }: ButtonProps) {
  return (
    <button className={`button ${color}`} onClick={onClick}>
      {text}
    </button>
  )
}

export default Button
