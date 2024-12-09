from apiflask import Schema
from apiflask.fields import String
from marshmallow_dataclass import dataclass


#@dataclass
class Artist():
    id: String()
    name: String()

    # def __init__(self):
    #     self.id = ''
    #     self.name = ''

        # if data:
        #     self.id = data['id']
        #     self.name = data['name']

