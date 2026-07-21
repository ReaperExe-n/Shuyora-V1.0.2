import React from 'react'
import { F } from './featured.style'
import { Link } from 'react-router-dom'

const CardItem = ({ data }) => {
  return (
    <Link 
      to={`/watch/${data.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <F.CardItem>
        <F.PosterDiv>
          <F.Img src={data.images.webp.image_url} />
        </F.PosterDiv>
        <F.DetailsWrapper>
          <F.Name>
            {data.title_english === null ? data.title : data.title_english}
          </F.Name>
          <F.Details>
            {data.type} • Ep {data.episodes == null ? '?' : data.episodes} •
            {data.duration === 'Unknown' ? '' : data.duration.slice(0, 2) + 'm'}
          </F.Details>
        </F.DetailsWrapper>
      </F.CardItem>
    </Link>
  )
}

export default CardItem
