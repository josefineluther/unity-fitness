type ButtonProps = {
  text: string
  color?: string
  onClick?: () => void
}

function Button({ text, onClick, color }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color === 'light' ? '#f6f6f6' : '#2d2d2d',
        color: color === 'light' ? '#2d2d2d' : '#f6f6f6'
      }}
    >
      {text}
    </button>
  )
}

export default Button
