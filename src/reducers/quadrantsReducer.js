let quadrantId = 0;

const allQuadrants = [];
for(let row = 0; row < 2; row++) {
	for(let col = 0; col < 2; col++) {
		allQuadrants.push({
			id: quadrantId++,
			row: row,
			col: col
		});
	}
}

const quadrantsById = allQuadrants.reduce((byId, quadrant) => (byId[quadrant.id] = quadrant) && byId, {});

function quadrants(state = quadrantsById, action) {
	switch(action.type) {
		default: return state;
	}
}

export default quadrants;