package models

import "time"

type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Title     string    `json:"title" gorm:"size:200;not null"`
	Message   string    `json:"message" gorm:"type:text"`
	Type      string    `json:"type" gorm:"size:30;default:info"`
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}
