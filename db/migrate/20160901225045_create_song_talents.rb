class CreateSongTalents < ActiveRecord::Migration[5.0]
  def change
    create_table :song_talents do |t|
      t.integer :song_id
      t.integer :talent_id

      t.timestamps(null: false)
    end
  end
end
