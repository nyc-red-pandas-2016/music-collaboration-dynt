class User < ApplicationRecord
  include ActiveModel::Serializers::JSON

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  # Sets up followers and following connections
  has_many :followed_connections, foreign_key: :follower_id, class_name: "Connection"
  has_many :follower_connections, foreign_key: :followed_id, class_name: "Connection"
  has_many :following, through: :followed_connections, source: :followed
  has_many :followers, through: :follower_connections, source: :follower

  # Sets up talents that user says they have upon signing up
  has_many :user_talents
  has_many :talents, through: :user_talents

  # Sets up users' preferred genres
  has_many :user_genres
  has_many :genres, through: :user_genres

  # Connects user to comment
  has_many :comments

  # Connets user to songs that they own
  has_many :songs, foreign_key: :owner_id

  # Sets up liking ability
  has_many :likes
  has_many :liked_tracks, through: :likes, source: :master_track

  # Sets up feature tracks and connections to collaborated tracks
  has_many :feature_tracks
  has_many :master_features, through: :feature_tracks
  has_many :master_tracks, through: :master_features
  has_many :collaborated_songs, through: :master_tracks, source: :song

  validates :email, format: { with: /\A[\w._]+@\w+[.]\w+\z/, message: "must be a valid e-mail address" }
  validates :username, length: { maximum: 18, minimum: 6 }
end
