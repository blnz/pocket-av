import { useState } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Divider,
} from "@mui/material";
import CardCreateDialog from "./CardCreateDialog";
import CardViewDialog from "./CardViewDialog";
import type { Card, CardClear } from "../../store/types";

interface CardsListProps {
  cards: Card[];
  onAddCard: (clear: CardClear) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
}

const searchStyle = {
  width: "90%",
  marginLeft: "20px",
};

export default function CardsList({
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: CardsListProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [search, setSearch] = useState("");

  const filteredCards = search
    ? cards.filter(
        (c) =>
          c.clear?.name
            ?.toLowerCase()
            .includes(search.toLowerCase()),
      )
    : cards;

  const sortedCards = [...filteredCards].sort((a, b) =>
    (a.clear?.name ?? "").localeCompare(b.clear?.name ?? ""),
  );

  return (
    <div>
      <TextField
        label="search"
        style={searchStyle}
        onChange={(e) => setSearch(e.target.value)}
        variant="standard"
        margin="dense"
        id="search"
        data-testid="input-search"
      />

      <List>
        {sortedCards.map((card) =>
          card.clear?.name ? (
            <div key={card.id}>
              <ListItemButton
                onClick={() => setActiveCard(card)}
                data-testid={`card-item-${card.id}`}
              >
                <ListItemText
                  primary={card.clear.name}
                  secondary={card.clear.url || undefined}
                />
              </ListItemButton>
              <Divider />
            </div>
          ) : null,
        )}
      </List>

      {activeCard && (
        <CardViewDialog
          card={activeCard}
          onSave={(updated) => {
            onUpdateCard(updated);
            setActiveCard(null);
          }}
          onDelete={(c) => {
            onDeleteCard(c);
            setActiveCard(null);
          }}
          onClose={() => setActiveCard(null)}
        />
      )}

      <CardCreateDialog onSave={onAddCard} />
    </div>
  );
}
