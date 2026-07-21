import React, { useState } from "react"
import { FaPlay } from "react-icons/fa"
import { Link } from "react-router-dom"
import { C } from "./card.style"
import CardToolTip from "../CardTooltip/CardToolTip"
import useScrollTooltip from "../../hooks/useScrollTooltip"

const Card = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { top, active, setActive } = useScrollTooltip()

  const handleMouseEnter = () => {
    setShowTooltip(true)
    setActive(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    setActive(false)
  }

  // Use the anime title as the GogoAnime search query
  const animeName = data.title?.english || data.title?.romaji

  return (
    <Link to={`/watch/${data.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <C.Card
        className={`card ${active ? "active" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <C.Poster>
          <C.Image src={data.coverImage?.large} />
          <C.InfoL>
            <C.BtnL>SUB</C.BtnL> <C.BtnL>DUB</C.BtnL>
          </C.InfoL>
          <C.InfoR>
            <C.BtnR>Ep {data.episodes || '?'}</C.BtnR>
          </C.InfoR>
          <FaPlay />
        </C.Poster>
        <C.Details>
          <C.Name>{animeName}</C.Name>
        </C.Details>
        {showTooltip ? <CardToolTip show={showTooltip} top={top} /> : null}
      </C.Card>
    </Link>
  )
}

export default Card

