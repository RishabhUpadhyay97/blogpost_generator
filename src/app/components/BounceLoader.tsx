import type React from "react"

const BounceLoader: React.FC = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: "0.6s",
          }}
        ></div>
      ))}
    </div>
  )
}

export default BounceLoader

