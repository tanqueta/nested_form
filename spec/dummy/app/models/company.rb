class Company < ActiveRecord::Base
  has_one :project
  accepts_nested_attributes_for :project

  after_initialize :inicilizar

  private
  def inicilizar
    self.build_project
  end
end
