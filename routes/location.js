import express from 'express';


const router = new express.Router();


// The route for getting all queues, no auth required
router.get('/', (req,res) => {
  return res.json({message: 'done'})
});


export default router;