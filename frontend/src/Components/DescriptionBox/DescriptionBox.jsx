import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repellat eveniet hic expedita, modi odio blanditiis ducimus corrupti rerum debitis magnam perspiciatis sequi minima unde praesentium sint tempore suscipit ipsa sed?</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quod exercitationem consequatur vero molestias distinctio numquam voluptatibus iusto ipsa nam!</p>
      </div>
    </div>
  )
}

export default DescriptionBox
