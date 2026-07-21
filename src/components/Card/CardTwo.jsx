import React from 'react'
import { C } from './card.style'
import { Link } from 'react-router-dom'

const CardTwo = ({ data }) => {
  const title = data.title?.english || data.title?.romaji;
  return (
    <Link to={`/anime/${data.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <C.Card>
        <C.Poster>
          <C.Image src={data.coverImage?.large} />
          <C.InfoL>
            <C.BtnL>SUB</C.BtnL> <C.BtnL>DUB</C.BtnL>
          </C.InfoL>
          <C.InfoR>
            <C.BtnR>Ep {data.episodes || '?'}</C.BtnR>
          </C.InfoR>
        </C.Poster>
        <C.Details>
          <C.Name>{title}</C.Name>
          <C.MovieInfo>
            {data.format || 'TV'} • {data.duration ? data.duration + 'm' : ''}
          </C.MovieInfo>
        </C.Details>
      </C.Card>
    </Link>
  )
}

export default CardTwo
